// Kept separate from diIngestionWorkflow so the source can be switched back
// to DI. Only /recherche is read here: the detail (/offre) is read when a
// fiche is arbitrated.

import {
  completeSourceRunStep,
  createSourceRunStep,
  ingestSourceStep,
} from "../../steps/ingestion/ingest-source";

export async function rcoIngestionWorkflow() {
  "use workflow";

  const runId = await createSourceRunStep("rco");
  try {
    const totals = await ingestSourceStep("rco", runId);
    await completeSourceRunStep("rco", runId, "completed", totals);
    // biome-ignore lint/suspicious/noConsole: pino cannot be used in "use workflow" scope
    console.log(
      JSON.stringify({ msg: "🏁 RCO ingestion completed", runId, ...totals }),
    );
    return { runId, status: "completed" as const, ...totals };
  } catch (error) {
    // Frees the "running" lock.
    await completeSourceRunStep(
      "rco",
      runId,
      "failed",
      undefined,
      String(error),
    );
    throw error;
  }
}
