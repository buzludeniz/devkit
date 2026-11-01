import { type Server, createServer } from "node:http";
import { afterEach, describe, expect, it } from "vitest";
import { testEndpoint } from "./api";

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
});
