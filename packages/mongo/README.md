# @playground/mongo

This package contains MongoDB related utilities and aggregation pipelines.

## Modules

### Dispositifs

The `dispositifs` module exports an aggregation pipeline `getDispositifsPipeline` that can be used to fetch dispositifs with their sponsors and other details, matching the structure of `packages/agents/samples/dispositifs.json`.

## Usage

```typescript
import { getDispositifs } from '@playground/mongo';

// Ensure MONGODB_URI is set in the root .env file

async function run() {
  try {
    const results = await getDispositifs();
    console.log(results);
  } catch (error) {
    console.error(error);
  }
}

```
