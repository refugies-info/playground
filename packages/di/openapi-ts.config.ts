import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: `${process.env.DI_BASE_URL}/api/openapi.json`,
  output: "src/hey-api",
  client: "@hey-api/client-fetch",
  parser: {
    filters: {
      operations: {
        // Exclude all v0 endpoints (e.g. GET /api/v0/structures, POST /api/v0/services, etc.)
        exclude: ["/^[A-Z]+ \\/api\\/v0\\//"],
      },
    },
  },
});
