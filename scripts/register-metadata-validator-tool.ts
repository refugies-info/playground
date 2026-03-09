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
 *                            Stored as VALIDATE_METADATA_RI_URL agent secret so the tool
 *                            endpoint is not hardcoded in the Python source.
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

  const client = createLettaClient();

  // Store the endpoint as an agent secret so the Python tool can read it
  // via os.getenv("VALIDATE_METADATA_RI_URL") without hardcoding the URL.
  await client.agents.update(agentId, {
    secrets: { VALIDATE_METADATA_RI_URL: endpoint },
  });
  logger.info({ agentId }, "Set VALIDATE_METADATA_RI_URL secret on agent");

  const sourceCode = `
import requests
import json
import ast
import os
import yaml
from typing import Union

def validate_metadata_ri(metadata_ri: Union[str, dict]) -> str:
    """
    Validates a metadata_ri JSON object against the Réfugiés.info schema.
    If valid, returns the canonical YAML frontmatter to use verbatim in the output.
    If invalid, returns a list of errors to fix.

    ALWAYS call this tool after producing your metadata_ri.
    If it returns errors, fix them and call it again.
    When it returns VALID, copy the returned frontmatter directly into your output.

    Args:
        metadata_ri: JSON string (or dict) of the metadata_ri object to validate

    Returns:
        On success: "VALID." followed by the canonical YAML frontmatter.
        On failure: "INVALID." followed by the list of errors to fix.
    """
    endpoint = os.getenv("VALIDATE_METADATA_RI_URL")

    try:
        if isinstance(metadata_ri, str):
            try:
                data = json.loads(metadata_ri)
            except json.JSONDecodeError:
                # Letta sometimes passes Python dict repr (single-quoted keys) instead of JSON
                data = ast.literal_eval(metadata_ri)
        else:
            data = metadata_ri
        response = requests.post(endpoint, json={"metadata_ri": data}, timeout=15)
        response.raise_for_status()
        result = response.json()

        if result.get("valid"):
            # Use the Zod-sanitized data returned by the API, not the raw input.
            # This ensures unknown fields are stripped before YAML generation.
            sanitized = result.get("data", data)
            frontmatter = "---\\n" + yaml.dump(
                {"metadata_ri": sanitized},
                allow_unicode=True,
                default_flow_style=False,
                sort_keys=False,
            ) + "---"
            return f"VALID. Use this exact YAML frontmatter in your output (copy verbatim, do not rewrite):\\n\\n{frontmatter}"

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

  // Upsert the tool (name is derived from the Python function definition)
  const tool = await client.tools.upsert({
    description:
      "Validates metadata_ri JSON against the Réfugiés.info schema. " +
      "Call after writing your metadata_ri output and fix any reported errors before responding.",
    source_code: sourceCode,
    source_type: "python",
    pip_requirements: [{ name: "requests" }, { name: "pyyaml" }],
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
