import * as Sentry from "@sentry/nextjs";
import "@playground/sentry/client";

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
