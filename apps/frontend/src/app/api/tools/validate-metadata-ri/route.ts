import { MetadataRiSchema } from "@playground/shared-types";
import type { NextRequest } from "next/server";
import { z } from "zod";

/**
 * POST /api/tools/validate-metadata-ri
 *
 * Validates a metadata_ri object against the Réfugiés.info schema.
 * Called by the Letta agent's `validate_metadata_ri` tool before finalizing output.
 *
 * Request body: { metadata_ri: object }
 * Response (valid):   { valid: true, data: object } — Zod-sanitized data (unknown fields stripped)
 * Response (invalid): { valid: false, errors: [{ field: string, message: string }] }
 */

const requestSchema = z.object({
  metadata_ri: z.record(z.unknown()),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch (_) {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Missing metadata_ri field", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const result = MetadataRiSchema.safeParse(parsed.data.metadata_ri);

  if (result.success) {
    // Return Zod-sanitized data so the tool uses validated output for YAML generation,
    // not the raw input which may contain unknown fields.
    return Response.json({ valid: true, data: result.data });
  }

  const errors = result.error.issues.map((issue) => ({
    field: issue.path.join(".") || "(root)",
    message: issue.message,
  }));

  return Response.json({ valid: false, errors });
}
