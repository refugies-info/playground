/** biome-ignore-all lint/suspicious/noConsole: It's fine for a script */
import { LettaService } from "../src/index";

async function main() {
  console.log("Initializing LettaService...");
  const service = new LettaService();

  try {
    console.log("Listing agents...");
    const agents = await service.listAgents();
    console.log("Agents:", agents);
  } catch (error) {
    console.error(
      "Error listing agents (expected if server is not running):",
      error instanceof Error ? error.message : String(error)
    );
  }
}

main();
