import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { riWebhookRequest } from "./webhook-client";

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

describe("riWebhookRequest", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    process.env.RI_BASE_URL = "https://ri.example/";
    process.env.RI_WEBHOOK_SECRET = "secret";
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it("calls the webhook with the shared secret and no cache by default", async () => {
    await riWebhookRequest("/api/webhook/structures");

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("https://ri.example/api/webhook/structures");
    expect(init).toMatchObject({
      method: "GET",
      headers: { "webhook-secret": "secret" },
      cache: "no-store",
    });
    expect(init.body).toBeUndefined();
  });

  it("uses the Next.js cache when a duration is given", async () => {
    await riWebhookRequest("/api/webhook/themes", { revalidateSeconds: 60 });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.next).toEqual({ revalidate: 60 });
    expect(init.cache).toBeUndefined();
  });

  it("serializes the body and skips undefined query values", async () => {
    await riWebhookRequest("/api/webhook/dispositif/search", {
      method: "POST",
      body: { a: 1 },
      query: { q: "asso", other: undefined },
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe(
      "https://ri.example/api/webhook/dispositif/search?q=asso",
    );
    expect(init.body).toBe('{"a":1}');
    expect(init.headers["Content-Type"]).toBe("application/json");
  });

  it("exposes the status and the field errors of a failed call", async () => {
    const errors = [{ key: "widgetConfig.type", message: "Invalid" }];
    fetchMock.mockResolvedValue(
      jsonResponse({ message: "Invalid payload", errors }, 400),
    );

    await expect(
      riWebhookRequest("/x", { method: "POST" }),
    ).rejects.toMatchObject({
      status: 400,
      details: errors,
      message: expect.stringContaining("Invalid payload"),
    });
  });

  it("keeps the raw text of a non-JSON error", async () => {
    fetchMock.mockResolvedValue(new Response("Bad gateway", { status: 502 }));

    await expect(riWebhookRequest("/x")).rejects.toMatchObject({
      status: 502,
      message: expect.stringContaining("Bad gateway"),
    });
  });

  it("fails fast when the configuration is missing", async () => {
    delete process.env.RI_WEBHOOK_SECRET;

    await expect(riWebhookRequest("/x")).rejects.toThrow(/RI_WEBHOOK_SECRET/);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
