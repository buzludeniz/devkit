import { type Server, createServer } from "node:http";
import { afterEach, describe, expect, it } from "vitest";
import { testEndpoint } from "./api.js";

const servers: Server[] = [];

async function serve(status: number, contentType = "application/json") {
  const server = createServer((_request, response) => {
    response.writeHead(status, { "content-type": contentType });
    response.end("{}");
  });
  servers.push(server);
  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();
  if (address === null || typeof address === "string") {
    throw new Error("Server did not expose a TCP port.");
  }

  return `http://127.0.0.1:${address.port}/`;
}

async function serveSequence(statuses: number[]) {
  let requests = 0;
  const server = createServer((_request, response) => {
    const status = statuses[Math.min(requests, statuses.length - 1)] ?? 500;
    requests += 1;
    response.writeHead(status, { "content-type": "application/json" });
    response.end("{}");
  });
  servers.push(server);
  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();
  if (address === null || typeof address === "string") {
    throw new Error("Server did not expose a TCP port.");
  }

  return {
    url: `http://127.0.0.1:${address.port}/`,
    requests: () => requests,
  };
}

afterEach(async () => {
  await Promise.all(
    servers.splice(0).map(
      (server) =>
        new Promise<void>((resolve) => {
          server.closeAllConnections();
          server.close(() => resolve());
        }),
    ),
  );
});

describe("testEndpoint", () => {
  it("passes when the status matches the expectation", async () => {
    const url = await serve(201);

    const result = await testEndpoint(url, { expect: 201 });

    expect(result.ok).toBe(true);
    expect(result.status).toBe(201);
    expect(result.contentType).toContain("application/json");
  });

  it("fails when the status differs from the expectation", async () => {
    const url = await serve(500);

    const result = await testEndpoint(url);

    expect(result.ok).toBe(false);
    expect(result.status).toBe(500);
  });

  it("returns an error instead of throwing when the host is unreachable", async () => {
    const result = await testEndpoint("http://127.0.0.1:1/", {
      timeoutMs: 2_000,
    });

    expect(result.ok).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it("retries transient failures and reports the retry count", async () => {
    const server = await serveSequence([500, 503, 200]);

    const result = await testEndpoint(server.url, { retries: 3 });

    expect(result.ok).toBe(true);
    expect(result.status).toBe(200);
    expect(result.retries).toBe(2);
    expect(server.requests()).toBe(3);
  });

  it("does not retry other 4xx responses", async () => {
    const server = await serveSequence([404, 200]);

    const result = await testEndpoint(server.url, { retries: 2 });

    expect(result.ok).toBe(false);
    expect(result.status).toBe(404);
    expect(result.retries).toBe(0);
    expect(server.requests()).toBe(1);
  });

  it("reports the last attempt after retries are exhausted", async () => {
    const server = await serveSequence([500, 502]);

    const result = await testEndpoint(server.url, { retries: 1 });

    expect(result.ok).toBe(false);
    expect(result.status).toBe(502);
    expect(result.retries).toBe(1);
    expect(server.requests()).toBe(2);
  });

  it("accepts zero retries", async () => {
    const server = await serveSequence([500, 200]);

    const result = await testEndpoint(server.url, { retries: 0 });

    expect(result.ok).toBe(false);
    expect(result.status).toBe(500);
    expect(result.retries).toBe(0);
    expect(server.requests()).toBe(1);
  });
});
