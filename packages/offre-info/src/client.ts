import {
  RCO_DEFAULT_BASE_URL,
  RCO_DEFAULT_MAX_REQUESTS_PER_SECOND,
} from "./config";

export type RcoQueryParams = Record<string, string | number | undefined>;

export type RcoClient = {
  get: (path: string, params?: RcoQueryParams) => Promise<unknown | null>;
};

export type RcoClientConfig = {
  token: string;
  baseUrl?: string;
  maxRequestsPerSecond?: number;
  fetchImpl?: typeof fetch;
  sleep?: (ms: number) => Promise<void>;
  now?: () => number;
};

const MAX_RETRIES = 3;
const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);
const RCO_AUTH_ERROR = "RcoAuthError";
const RCO_RATE_LIMIT_ERROR = "RcoRateLimitError";

const defaultSleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const namedError = (name: string, message: string) =>
  Object.assign(new Error(message), { name });

export const isRcoAuthError = (error: unknown): boolean =>
  error instanceof Error && error.name === RCO_AUTH_ERROR;

export const isRcoRateLimitError = (error: unknown): boolean =>
  error instanceof Error && error.name === RCO_RATE_LIMIT_ERROR;

const retryDelayMs = (response: Response, attempt: number) => {
  const retryAfterSeconds = Number(response.headers.get("Retry-After"));
  return retryAfterSeconds > 0 ? retryAfterSeconds * 1000 : 1000 * 2 ** attempt;
};

export function createRcoClient({
  token,
  baseUrl = RCO_DEFAULT_BASE_URL,
  maxRequestsPerSecond = RCO_DEFAULT_MAX_REQUESTS_PER_SECOND,
  fetchImpl = fetch,
  sleep = defaultSleep,
  now = Date.now,
}: RcoClientConfig): RcoClient {
  const minIntervalMs = 1000 / maxRequestsPerSecond;
  let nextSlotAt = 0;

  const waitForSlot = async () => {
    const waitMs = nextSlotAt - now();
    if (waitMs > 0) await sleep(waitMs);
    nextSlotAt = Math.max(now(), nextSlotAt) + minIntervalMs;
  };

  const get = async (path: string, params: RcoQueryParams = {}) => {
    const url = new URL(path, baseUrl);
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }

    for (let attempt = 0; ; attempt++) {
      await waitForSlot();
      const response = await fetchImpl(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (response.ok) return response.json();
      if (response.status === 404) return null;
      if (response.status === 401) {
        throw namedError(RCO_AUTH_ERROR, "RCO API rejected the token (401)");
      }
      if (RETRYABLE_STATUSES.has(response.status) && attempt < MAX_RETRIES) {
        await sleep(retryDelayMs(response, attempt));
        continue;
      }
      if (response.status === 429) {
        throw namedError(
          RCO_RATE_LIMIT_ERROR,
          `RCO API rate limit reached on ${url.pathname}`,
        );
      }
      throw new Error(
        `RCO API ${response.status} on ${url.pathname}: ${await response.text()}`,
      );
    }
  };

  return { get };
}

export function getRcoClientFromEnv(): RcoClient {
  const token = process.env.RCO_TOKEN;
  if (!token) throw namedError(RCO_AUTH_ERROR, "RCO_TOKEN is not defined");
  return createRcoClient({
    token,
    baseUrl: process.env.RCO_BASE_URL || RCO_DEFAULT_BASE_URL,
    maxRequestsPerSecond:
      Number(process.env.RCO_MAX_RPS) || RCO_DEFAULT_MAX_REQUESTS_PER_SECOND,
  });
}
