import { Command } from "commander";

export interface ApiTestOptions {
  /** Expected HTTP status code. Defaults to 200. */
  expect?: number;
  /** Request timeout in milliseconds. Defaults to 10000. */
  timeoutMs?: number;
}

export interface ApiTestResult {
  url: string;
  ok: boolean;
  status?: number;
  durationMs: number;
  contentType?: string;
  error?: string;
}

/**
 * Sends a GET request and compares the response status with the expectation.
 *
 * Network and timeout failures are returned as `ok: false` with an `error`
 * message instead of throwing, so a caller can report every endpoint in a batch.
 */
export async function testEndpoint(
  url: string,
  options: ApiTestOptions = {},
): Promise<ApiTestResult> {
  const expected = options.expect ?? 200;
  const timeoutMs = options.timeoutMs ?? 10_000;
  const startedAt = Date.now();

  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(timeoutMs),
    });
    const durationMs = Date.now() - startedAt;
    await response.body?.cancel();

    return {
      url,
      ok: response.status === expected,
      status: response.status,
      durationMs,
      contentType: response.headers.get("content-type") ?? undefined,
    };
  } catch (error) {
    return {
      url,
      ok: false,
      durationMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export function apiTestCommand(): Command {
  return new Command("api:test")
    .description("Send a GET request and assert the response status")
    .argument("<url>", "API endpoint URL")
    .option("-e, --expect <code>", "expected HTTP status", "200")
    .option("-t, --timeout <ms>", "request timeout in milliseconds", "10000")
    .action(async (url: string, options: { expect: string; timeout: string }) => {
      const result = await testEndpoint(url, {
        expect: Number(options.expect),
        timeoutMs: Number(options.timeout),
      });

      if (result.error) {
        console.error(`FAIL ${url} after ${result.durationMs}ms: ${result.error}`);
        process.exitCode = 1;
        return;
      }

      const label = result.ok ? "PASS" : "FAIL";
      console.log(`${label} ${result.status} ${url} (${result.durationMs}ms)`);

      if (!result.ok) {
        console.error(`Expected HTTP ${options.expect}, received ${result.status}.`);
        process.exitCode = 1;
      }
    });
}
