// Kept separate from diIngestionWorkflow so the source can be switched back
// to DI. Only /recherche is read here: the detail (/offre) is read when a
// fiche is arbitrated.

import {
  completeRcoRunStep,
  createRcoRunStep,
  ingestRcoStep,
} from "../../steps/ingestion/ingest-rco";

export async function rcoIngestionWorkflow() {
  "use workflow";

  const runId = await createRcoRunStep();
  try {
    const totals = await ingestRcoStep(runId);
    await completeRcoRunStep(runId, "completed", totals);
    // biome-ignore lint/suspicious/noConsole: pino cannot be used in "use workflow" scope
    console.log(
      JSON.stringify({ msg: "🏁 RCO ingestion completed", runId, ...totals }),
    );
    return { runId, status: "completed" as const, ...totals };
  } catch (error) {
    // Frees the "running" lock.
    await completeRcoRunStep(runId, "failed", undefined, String(error));
    throw error;
  }
}
