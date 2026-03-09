/**
 * Registers the `validate_metadata_ri` tool on the Letta agent.
 *
 * This tool lets the agent validate its own metadata_ri output against
 * the Réfugiés.info schema before returning it. The tool calls the
 * /api/tools/validate-metadata-ri endpoint.
 *
 * Usage:
 *   pnpm tsx scripts/register-metadata-validator-tool.ts
 *
 * Required env vars:
 *   LETTA_API_KEY          — Letta Cloud API key
 *   LETTA_PROJECT_ID       — Letta Cloud project ID
 *   PLAYGROUND_AGENT_ID    — ID of the agent to attach the tool to
 *   NEXT_PUBLIC_APP_URL    — Base URL of the deployed app (e.g. https://your-app.vercel.app)
 */
import "dotenv/config";
import { logger } from "@playground/shared-types";
import { createLettaClient } from "../packages/agents/src/index";

async function main() {
  const agentId = process.env.PLAYGROUND_AGENT_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";

  if (!agentId) {
    throw new Error("PLAYGROUND_AGENT_ID environment variable is not set.");
  }

  const endpoint = `${appUrl}/api/tools/validate-metadata-ri`;
  logger.info({ endpoint, agentId }, "Registering validate_metadata_ri tool");

  const sourceCode = `
import requests
import json

def validate_metadata_ri(metadata_ri: str) -> str:
    """
    Validates a metadata_ri JSON object against the Réfugiés.info schema.

    ALWAYS call this tool after writing your metadata_ri output.
    If it returns errors, fix them and call it again before responding.
    Only respond once it returns "VALID".

    Args:
        metadata_ri: JSON string of the metadata_ri object to validate

    Returns:
        "VALID: ..." if the object is correctly formatted, or a list of errors to fix.
    """
    endpoint = "${endpoint}"

    try:
        data = json.loads(metadata_ri) if isinstance(metadata_ri, str) else metadata_ri
        response = requests.post(endpoint, json={"metadata_ri": data}, timeout=15)
        response.raise_for_status()
        result = response.json()

        if result.get("valid"):
            return "VALID: metadata_ri is correctly formatted."

        errors = result.get("errors", [])
        if not errors:
            return "INVALID: unknown validation error — check your output format."

        lines = ["INVALID. Fix these errors before responding:"]
        for e in errors:
            field = e.get("field", "?")
            message = e.get("message", "invalid value")
            lines.append(f"  - {field}: {message}")

        return "\\n".join(lines)

    except requests.exceptions.Timeout:
        return "ERROR: Validation service timed out. Review your output manually."
    except Exception as e:
        return f"ERROR: Could not validate ({str(e)}). Review your output manually."
`.trim();

  const client = createLettaClient();

  // Upsert the tool (create or update by name)
  const tool = await client.tools.upsert({
    name: "validate_metadata_ri",
    description:
      "Validates metadata_ri JSON against the Réfugiés.info schema. " +
      "Call after writing your metadata_ri output and fix any reported errors before responding.",
    source_code: sourceCode,
    source_type: "python",
    pip_requirements: [{ name: "requests" }],
    tags: ["playground", "metadata", "validation"],
  });

  logger.info({ toolId: tool.id, toolName: tool.name }, "Tool upserted");

  // Attach the tool to the agent
  await client.agents.tools.attach(tool.id, { agent_id: agentId });

  logger.info({ toolId: tool.id, agentId }, "Tool attached to agent");
  logger.info("Done. The agent can now call validate_metadata_ri.");
}

main().catch((err) => {
  logger.error(err, "Failed to register tool");
  process.exit(1);
});
