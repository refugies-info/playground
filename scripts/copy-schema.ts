import fs from "node:fs";
import path from "node:path";

const schemaSource = path.join(__dirname, "../packages/rco/json-schema.json");
const frontendSchemaTarget = path.join(
  __dirname,
  "../apps/frontend/public/rco-json-schema.json",
);

const ensureDir = (targetPath: string) => {
  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

(() => {
  if (!fs.existsSync(schemaSource)) {
    throw new Error(`Schema not found at ${schemaSource}`);
  }

  ensureDir(frontendSchemaTarget);
  fs.copyFileSync(schemaSource, frontendSchemaTarget);
  // biome-ignore lint/suspicious/noConsole: script output
  console.log(`Copied schema to ${frontendSchemaTarget}`);
})();
