import { Command } from "commander";

export interface ApiTestOptions {
  /** Expected HTTP status code. Defaults to 200. */
  expect?: number;
  /** Request timeout in milliseconds. Defaults to 10000. */
  timeoutMs?: number;
  /** Number of retries for transient failures. Defaults to 2. */
  retries?: number;
}

export interface ApiTestResult {
  url: string;
  ok: boolean;
  status?: number;
  durationMs: number;
  contentType?: string;
  error?: string;
  /** Number of retries performed before this result. */
  retries: number;
}

const BASE_RETRY_DELAY_MS = 100;
const MAX_RETRY_DELAY_MS = 1_000;

function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 429 || (status >= 500 && status < 600);
}

function retryDelay(retry: number): number {
  return Math.min(BASE_RETRY_DELAY_MS * 2 ** retry, MAX_RETRY_DELAY_MS);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
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
  const maxRetries = Math.max(0, options.retries ?? 2);

  for (let retry = 0; ; retry += 1) {
    const startedAt = Date.now();

    try {
      const response = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: AbortSignal.timeout(timeoutMs),
      });
      const durationMs = Date.now() - startedAt;
      await response.body?.cancel();

      const result: ApiTestResult = {
        url,
        ok: response.status === expected,
        status: response.status,
        durationMs,
        contentType: response.headers.get("content-type") ?? undefined,
        retries: retry,
      };

      if (result.ok || retry >= maxRetries || !isRetryableStatus(response.status)) {
        return result;
      }
    } catch (error) {
      if (retry >= maxRetries) {
        return {
          url,
          ok: false,
          durationMs: Date.now() - startedAt,
          error: error instanceof Error ? error.message : String(error),
          retries: retry,
        };
      }
    }

    await sleep(retryDelay(retry));
  }
}

export function apiTestCommand(): Command {
  return new Command("api:test")
    .description("Send a GET request and assert the response status")
    .argument("<url>", "API endpoint URL")
    .option("-e, --expect <code>", "expected HTTP status", "200")
    .option("-t, --timeout <ms>", "request timeout in milliseconds", "10000")
    .option("-r, --retries <n>", "retries for transient failures", "2")
    .action(async (url: string, options: { expect: string; timeout: string; retries: string }) => {
      const result = await testEndpoint(url, {
        expect: Number(options.expect),
        timeoutMs: Number(options.timeout),
        retries: Number(options.retries),
      });

      if (result.error) {
        const retryNote = result.retries > 0 ? ` after ${result.retries} retries` : "";
        console.error(`FAIL ${url} after ${result.durationMs}ms${retryNote}: ${result.error}`);
        process.exitCode = 1;
        return;
      }

      const label = result.ok ? "PASS" : "FAIL";
      const retryNote = result.retries > 0 ? `, ${result.retries} retries` : "";
      console.log(`${label} ${result.status} ${url} (${result.durationMs}ms${retryNote})`);

      if (!result.ok) {
        console.error(`Expected HTTP ${options.expect}, received ${result.status}.`);
        process.exitCode = 1;
      }
    });
}
