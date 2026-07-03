"use server";

import { TYPE_NOTE } from "@playground/shared-types";
import { recordActivity } from "@playground/workflows";
import { getCurrentUser } from "@/lib/auth";

/**
 * Publish a free-form note in a document's activity journal.
 * The note text is carried in the activity payload (`{ note }`).
 */
export async function publishNoteAction(
  workflowId: string,
  note: string,
): Promise<{ success: boolean; error?: string }> {
  const currentUser = await getCurrentUser();

  const trimmed = note.trim();
  if (!trimmed) {
    return { success: false, error: "La note est vide" };
  }

  const logId = await recordActivity({
    action: TYPE_NOTE,
    authorId: currentUser.id,
    workflowId,
    activity: { note: trimmed },
  });

  if (!logId) {
    return { success: false, error: "La note n'a pas été publiée" };
  }

  return { success: true };
}
