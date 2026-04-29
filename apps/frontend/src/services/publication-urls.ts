"use server";

import { LANGUAGES } from "@playground/shared-types";
import { createSupabaseServerClient } from "@playground/supabase";
import { cookies } from "next/headers";
import { buildPublicationUrl } from "@/lib/url-builder";

export interface LanguagePublicationStatus {
  code: string;
  label: string;
  publishedUrl: string | null;
}

/**
 * Fetches publication URLs for all RI languages for a given workflow.
 *
 * FR is always published first (workflow invariant), so its URL is built
 * directly from the `frRemoteId` passed as parameter — no extra query needed.
 *
 * Other languages: queried from `translation_records` joined with
 * `publication_records` (via `translation_record_id`).
 *
 * @param workflowId  - The workflow ID (= document ID in DocumentContext)
 * @param frRemoteId  - MongoDB ObjectId of the published FR document
 *                      (= `document.publicationRemoteId` in DocumentContext)
 */
export async function getPublicationUrls(
  workflowId: string,
  frRemoteId: string,
): Promise<LanguagePublicationStatus[]> {
  const baseUrl = process.env.RI_BASE_URL;
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  // Query translation records (non-FR) with their publication records
  const { data: translations, error } = await supabase
    .from("translation_records")
    .select(
      `
      language,
      online_status,
      publication_records (
        remote_id,
        status
      )
    `,
    )
    .eq("workflow_id", workflowId);

  if (error) {
    // On failure, return all languages unpublished (except FR)
    return LANGUAGES.map((l) => ({
      code: l.code,
      label: l.label,
      publishedUrl:
        l.code === "fr" ? buildPublicationUrl(baseUrl, "fr", frRemoteId) : null,
    }));
  }

  // Build a map of published translation URLs by language code
  const publishedByLang: Record<string, string | null> = {};

  for (const tr of translations ?? []) {
    if (tr.online_status !== "published") {
      publishedByLang[tr.language] = null;
      continue;
    }

    // Find latest successful publication record for this translation
    const pubRecords = (
      tr.publication_records as { remote_id: string; status: string }[]
    ).filter((pr) => pr.status === "published");

    const remoteId = pubRecords[0]?.remote_id ?? null;
    publishedByLang[tr.language] = buildPublicationUrl(
      baseUrl,
      tr.language,
      remoteId,
    );
  }

  // Merge with full LANGUAGES list — FR always published, others from DB
  return LANGUAGES.map((l) => ({
    code: l.code,
    label: l.label,
    publishedUrl:
      l.code === "fr"
        ? buildPublicationUrl(baseUrl, "fr", frRemoteId)
        : (publishedByLang[l.code] ?? null),
  }));
}
