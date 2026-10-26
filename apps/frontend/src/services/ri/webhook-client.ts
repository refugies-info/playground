interface RiWebhookRequestOptions {
  method?: "GET" | "POST" | "PATCH";
  body?: unknown;
  query?: Record<string, string | undefined>;
  revalidateSeconds?: number;
}

export type RiWebhookError = Error & {
  status: number;
  details?: unknown;
};

function getConfig() {
  const baseUrl = process.env.RI_BASE_URL;
  const secret = process.env.RI_WEBHOOK_SECRET;

  if (!baseUrl || !secret) {
    throw new Error("Missing RI_BASE_URL or RI_WEBHOOK_SECRET for RI webhook");
  }

  return { baseUrl: baseUrl.replace(/\/$/, ""), secret };
}

async function createRiWebhookError(
  response: Response,
  description: string,
): Promise<RiWebhookError> {
  const text = await response.text().catch(() => "");
  let details: unknown;
  let message = text;
  try {
    const parsed = JSON.parse(text) as { message?: string; errors?: unknown };
    message = parsed.message ?? text;
    details = parsed.errors;
  } catch {}

  return Object.assign(
    new Error(
      `RI webhook ${description} failed: ${response.status} ${message}`,
    ),
    { status: response.status, details },
  );
}

export async function riWebhookRequest<T>(
  path: string,
  options: RiWebhookRequestOptions = {},
): Promise<T> {
  const { method = "GET", body, query, revalidateSeconds } = options;
  const { baseUrl, secret } = getConfig();

  const url = new URL(`${baseUrl}${path}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) url.searchParams.set(key, value);
  }

  const response = await fetch(url, {
    method,
    headers: {
      "webhook-secret": secret,
      ...(body !== undefined && { "Content-Type": "application/json" }),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(10_000), // 10s max — avoids silent hangs
    ...(revalidateSeconds !== undefined
      ? { next: { revalidate: revalidateSeconds } }
      : { cache: "no-store" as const }),
  });

  if (!response.ok) {
    throw await createRiWebhookError(response, `${method} ${path}`);
  }

  return response.json();
}
