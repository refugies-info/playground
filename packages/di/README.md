# Data Inclusion API Client

TypeScript client for the [Data Inclusion API](https://api.data.inclusion.gouv.fr/).

## Environment Variables

The client requires the following environment variables in `packages/di/.env`:

```bash
DI_BASE_URL=https://api-staging.data.inclusion.gouv.fr
DI_API_KEY=your_api_key_here
```

## Generating the Client

The client is generated using [@hey-api/openapi-ts](https://www.npmjs.com/package/@hey-api/openapi-ts) from the Data Inclusion OpenAPI specification.

### How to regenerate

```bash
cd packages/di
pnpm run gen:client
```

This will:
1. Load environment variables from `packages/di/.env`
2. Fetch the OpenAPI spec from `$DI_BASE_URL/api/openapi.json`
3. Generate TypeScript client files in `src/hey-api/`

### Generated Files

The generated client is located in `src/hey-api/` and includes:
- `client.gen.ts` - Configured HTTP client instance
- `sdk.gen.ts` - API endpoint functions
- `types.gen.ts` - TypeScript types for all API models
- `index.ts` - Main exports

## Usage

```typescript
import { listStructures } from '@refugies-info/di';

// The client is automatically configured with DI_BASE_URL and DI_API_KEY
const structures = await listStructures();
```

## Configuration

The client is pre-configured in `src/index.ts` with:
- Base URL from `DI_BASE_URL` environment variable
- Authorization header with `DI_API_KEY` as Bearer token

You can override these settings per-request by passing options:

```typescript
import { listStructures } from '@refugies-info/di';

await listStructures({
  client: customClientInstance, // Use a different client
  // ... other options
});
```

## Notes

- Generated files in `src/hey-api/` are excluded from Biome linting/formatting
- The client uses the `@hey-api/client-fetch` adapter for HTTP requests
- API endpoints use `/api/v1/` prefix (defined in the OpenAPI spec)
