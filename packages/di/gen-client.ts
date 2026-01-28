import { execSync } from "child_process";
import { config } from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

// Load .env file from the same directory as this script
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, ".env") });

// Get the DI_BASE_URL from environment
const diBaseUrl = process.env.DI_BASE_URL;

if (!diBaseUrl) {
  console.error("Error: DI_BASE_URL is not set in .env file");
  process.exit(1);
}

// Run the hey-api command with config file
const command = "pnpx @hey-api/openapi-ts";

console.log(`Generating client from: ${diBaseUrl}/api/openapi.json`);
console.log("Excluding /api/v0/ endpoints...");

try {
  execSync(command, { stdio: "inherit" });
  console.log("Client generated successfully!");
} catch (error) {
  console.error("Failed to generate client:", error);
  process.exit(1);
}
