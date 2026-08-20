import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("@playground/sentry/server");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("@playground/sentry/edge");
  }
}

export const onRequestError = Sentry.captureRequestError;
