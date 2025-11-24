import { type NextRequest, NextResponse } from "next/server";

/**
 * POST /api/classify
 * Proxy endpoint for Letta AI classification/quality gating.
 * Stub implementation for Sprint 0 scaffolding.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    if (!body.contentId || !body.text) {
      return NextResponse.json(
        {
          error: "Missing required fields: contentId, text",
        },
        { status: 400 },
      );
    }

    // TODO: Implement actual Letta API call in Sprint 1
    // const response = await fetch(process.env.LETTA_API_URL, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.LETTA_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     contentId: body.contentId,
    //     text: body.text,
    //   }),
    // });

    return NextResponse.json(
      {
        message: "Classification stub - implementation deferred to Sprint 1",
        contentId: body.contentId,
        classification: {
          status: "pending",
          reasoning: "Letta integration not yet implemented",
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Classification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
