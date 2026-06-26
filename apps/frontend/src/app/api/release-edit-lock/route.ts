import { logger } from "@playground/shared-types";
import { createSupabaseServerClient } from "@playground/supabase";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { editorialRecordId } = (await request.json()) as {
      editorialRecordId?: string;
    };

    if (!editorialRecordId) {
      return NextResponse.json(
        { error: "editorialRecordId requis" },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    const supabase = createSupabaseServerClient(cookieStore);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { error } = await supabase
      .from("editorial_records")
      .update({ current_editor_id: null })
      .eq("id", editorialRecordId)
      .eq("current_editor_id", user.id);

    if (error) {
      logger.error(error, "Error releasing edit lock via API");
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error(error, "Unexpected error in release-edit-lock");
    return NextResponse.json({ error: "Erreur inattendue" }, { status: 500 });
  }
}
