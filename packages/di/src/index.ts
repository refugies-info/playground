import { client } from "./hey-api/client.gen";

// configure internal service client
client.setConfig({
  // set default base url for requests
  baseUrl:
    process.env.DI_BASE_URL || "https://api-staging.data.inclusion.gouv.fr",
  // set default headers for requests
  headers: {
    Authorization: `Bearer ${process.env.DI_API_KEY}`,
  },
});

export * from "./hey-api";
export * from "./ingest";
