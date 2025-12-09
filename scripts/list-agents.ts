import { logger } from "@playground/shared-types";
import { createLettaClient, listAgents } from "../packages/agents/src/index";

async function main() {
  logger.info("Initializing Letta client...");
  const client = createLettaClient();

  try {
    logger.info("Listing agents...");
    const agents = await listAgents(client);
    logger.info({ agents }, "Agents list");
  } catch (error) {
    logger.error(
      error,
      "Error listing agents (expected if server is not running)",
    );
  }
}

main();
