import { logger } from "@playground/shared-types";
import { createSupabaseServerClient } from "@playground/supabase";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ workflowId: string }> },
) {
  const { workflowId } = await params;
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const { data: publicationRecord, error } = await supabase
    .from("publication_records")
    .select("remote_id, status")
    .eq("workflow_id", workflowId)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    logger.error({ error, workflowId }, "Failed to fetch publication status");
    return NextResponse.json(
      { success: false, error: "Failed to fetch publication status" },
      { status: 500 },
    );
  }

  const cleanBaseUrl = (process.env.RI_BASE_URL || "").replace(/\/$/, "");
  const publishedUrl =
    publicationRecord?.remote_id && cleanBaseUrl
      ? `${cleanBaseUrl}/dispositif/${publicationRecord.remote_id}`
      : undefined;

  return NextResponse.json({ success: true, publishedUrl });
}
