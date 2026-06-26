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
  ],
  serverExternalPackages: ["libxml2-wasm", "pino", "pino-pretty"],
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

export default withWorkflow(nextConfig);
