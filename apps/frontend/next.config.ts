import { withSentryConfig } from "@sentry/nextjs";
/** biome-ignore-all lint/suspicious/noConsole: Fine for early warnings */

import { withWorkflow } from "@workflow/next";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@playground/ui",
    "@playground/rco",
    "@playground/agents",
    "@playground/workflows",
    "@playground/supabase",
    "@playground/cloudinary",
  ],
  serverExternalPackages: ["libxml2-wasm", "pino", "pino-pretty"],
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
};

// Validate required environment variables at build time
if (typeof window === "undefined") {
  const requiredEnvVars = ["NEXT_PUBLIC_SUPABASE_URL"];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.warn(
        `Warning: Missing environment variable ${envVar}. This may cause runtime errors.`,
      );
    }
  }

  // Check for either anon key (legacy) or publishable key (new)
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    console.warn(
      "Warning: Missing Supabase key. Please define NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
}

export default withSentryConfig(withWorkflow(nextConfig), {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "betagouv",

  project: "refugiesinfo-bomo",
  sentryUrl: "https://sentry.incubateur.net/",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
