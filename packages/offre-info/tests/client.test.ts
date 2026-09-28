import { describe, expect, it, vi } from "vitest";
import {
  createRcoClient,
  isRcoAuthError,
  isRcoRateLimitError,
} from "../src/client";

const fakeClock = () => {
  let currentTime = 0;
  return {
    now: () => currentTime,
    sleep: vi.fn(async (ms: number) => {
      currentTime += ms;
    }),
  };
};

const json = (body: unknown, status = 200, headers?: Record<string, string>) =>
  new Response(JSON.stringify(body), { status, headers });

describe("createRcoClient", () => {
  it("sends the bearer token and query params", async () => {
    const fetchImpl = vi.fn(async () => json({ ok: true }));
    const client = createRcoClient({ token: "t", fetchImpl, ...fakeClock() });
    await client.get("/recherche", { page: 2, q: undefined });
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [
      URL,
      RequestInit,
    ];
    expect(url.toString()).toBe(
      "https://api-offreinfo.intercariforef.org/recherche?page=2",
    );
    expect(init.headers).toMatchObject({ Authorization: "Bearer t" });
  });

  it("spaces requests to respect the rate limit", async () => {
    const clock = fakeClock();
    const fetchImpl = vi.fn(async () => json({}));
    const client = createRcoClient({
      token: "t",
      fetchImpl,
      maxRequestsPerSecond: 5,
      ...clock,
    });
    await client.get("/a");
    await client.get("/b");
    expect(clock.sleep).toHaveBeenCalledWith(200);
  });

  it("retries 429 with Retry-After then succeeds", async () => {
    const clock = fakeClock();
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(json({}, 429, { "Retry-After": "2" }))
      .mockResolvedValueOnce(json({ done: true }));
    const client = createRcoClient({ token: "t", fetchImpl, ...clock });
    await expect(client.get("/a")).resolves.toEqual({ done: true });
    expect(clock.sleep).toHaveBeenCalledWith(2000);
  });

  it("raises a rate limit error after 3 retries on 429", async () => {
    const fetchImpl = vi.fn(async () => json({}, 429));
    const client = createRcoClient({ token: "t", fetchImpl, ...fakeClock() });
    const error = await client.get("/a").catch((caught: unknown) => caught);
    expect(isRcoRateLimitError(error)).toBe(true);
    expect(fetchImpl).toHaveBeenCalledTimes(4);
  });

  it("gives up after 3 retries on 5xx", async () => {
    const fetchImpl = vi.fn(async () => json({}, 503));
    const client = createRcoClient({ token: "t", fetchImpl, ...fakeClock() });
    await expect(client.get("/a")).rejects.toThrow("RCO API 503");
  });

  it("returns null on 404", async () => {
    const client = createRcoClient({
      token: "t",
      fetchImpl: async () => json({}, 404),
      ...fakeClock(),
    });
    await expect(client.get("/offre")).resolves.toBeNull();
  });

  it("flags 401 as an auth error", async () => {
    const client = createRcoClient({
      token: "t",
      fetchImpl: async () => json({}, 401),
      ...fakeClock(),
    });
    const error = await client.get("/a").catch((caught: unknown) => caught);
    expect(isRcoAuthError(error)).toBe(true);
  });
});
