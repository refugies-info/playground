import { client } from "./client/client.gen";

// configure internal service client
client.setConfig({
  // set default base url for requests
  baseUrl: `${process.env.DI_BASE_URL}/api/v0`,
  // set default headers for requests
  headers: {
    Authorization: `Bearer ${process.env.DI_API_KEY}`,
  },
});
