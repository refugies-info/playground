import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

// Load .env file from project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, "../../.env") });

// Get the DI_BASE_URL from environment
const diBaseUrl = process.env.DI_BASE_URL;

if (!diBaseUrl) {
  // biome-ignore lint/suspicious/noConsole: build script
  console.error("Error: DI_BASE_URL is not set in root .env file");
  process.exit(1);
}

// Run the hey-api command with config file
const command = "pnpx @hey-api/openapi-ts";

// biome-ignore lint/suspicious/noConsole: build script
console.log(`Generating client from: ${diBaseUrl}/api/openapi.json`);
// biome-ignore lint/suspicious/noConsole: build script
console.log("Excluding /api/v0/ endpoints...");

try {
  execSync(command, { stdio: "inherit" });
  // biome-ignore lint/suspicious/noConsole: build script
  console.log("Client generated successfully!");
} catch (error) {
  // biome-ignore lint/suspicious/noConsole: build script
  console.error("Failed to generate client:", error);
  process.exit(1);
}
