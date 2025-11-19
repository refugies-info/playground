import { NextRequest, NextResponse } from "next/server";

import type { ContentItem } from "@shared/types";

/**
 * POST /api/content
 * Manual ingestion endpoint for uploading content items.
 * Stub implementation for Sprint 0 scaffolding.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    if (!body.originalText || !body.sourceRecordId) {
      return NextResponse.json(
        {
          error: "Missing required fields: originalText, sourceRecordId",
        },
        { status: 400 }
      );
    }

    // Prepare content item (stub - no actual DB write in Sprint 0)
    const contentItem: Partial<ContentItem> = {
      originalText: body.originalText,
      languageCode: "fr",
      sourceSystem: body.sourceSystem || "manual_upload",
      sourceRecordId: body.sourceRecordId,
      createdAt: new Date().toISOString(),
      createdBy: body.userId || "system",
    };

    // TODO: Implement actual Supabase write in Sprint 1
    // const { data, error } = await supabaseServer
    //   .from('content_items')
    //   .insert([contentItem]);

    return NextResponse.json(
      {
        message: "Content ingestion stub - implementation deferred to Sprint 1",
        contentItem,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Content ingestion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/content
 * Retrieve content items (stub).
 */
export async function GET() {
  return NextResponse.json(
    {
      message: "Content retrieval stub - implementation deferred to Sprint 1",
      items: [],
    },
    { status: 200 }
  );
}
