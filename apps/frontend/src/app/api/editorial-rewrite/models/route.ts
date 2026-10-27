/**
 * GET /api/editorial-rewrite/models
 *
 * Liste les modèles Letta disponibles pour relancer le langage clair
 * avec un modèle choisi. Réservé aux admins.
 */

import { createLettaClient } from "@playground/agents";
import { logger } from "@playground/shared-types";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const currentUser = await getCurrentUser();
  if (currentUser.role !== "admin") {
    return NextResponse.json({ error: "Réservé aux admins" }, { status: 403 });
  }

  try {
    const models = await createLettaClient().models.list();
    return NextResponse.json({
      models: models
        .filter((model) => model.handle)
        .map((model) => ({
          handle: model.handle,
          name: model.display_name || model.handle,
        })),
    });
  } catch (error) {
    logger.error({ error }, "[editorial-rewrite] Failed to list Letta models");
    return NextResponse.json(
      { error: "Impossible de récupérer les modèles" },
      { status: 500 },
    );
  }
}
