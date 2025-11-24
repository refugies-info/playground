import { NextResponse } from "next/server";

/**
 * GET /api/health
 * Health check endpoint for monitoring and deployment verification.
 */
export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
    },
    { status: 200 },
  );
}
