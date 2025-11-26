/** biome-ignore-all lint/suspicious/noConsole: It's fine for a script */
import { createLettaClient, listAgents } from "../src/index";

async function main() {
  console.log("Initializing Letta client...");
  const client = createLettaClient();

  try {
    console.log("Listing agents...");
    const agents = await listAgents(client);
    console.log("Agents:", agents);
  } catch (error) {
    console.error(
      "Error listing agents (expected if server is not running):",
      error instanceof Error ? error.message : String(error)
    );
  }
}

main();
