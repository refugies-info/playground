import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

// Validate required environment variables at build time
if (typeof window === "undefined") {
  const requiredEnvVars = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.warn(
        `Warning: Missing environment variable ${envVar}. This may cause runtime errors.`
      );
    }
  }
}

export default nextConfig;
