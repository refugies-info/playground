import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    DI_BASE_URL: process.env.DI_BASE_URL ?? "(undefined)",
    DI_API_KEY_length: process.env.DI_API_KEY?.length ?? 0,
    fallback: "https://api.data.inclusion.beta.gouv.fr",
  });
}
