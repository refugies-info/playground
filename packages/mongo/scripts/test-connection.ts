/** biome-ignore-all lint/suspicious/noConsole: Fine for test scripts */
import "dotenv/config";
import { getDispositifs } from "../src";

// Mock process.env.MONGODB_URI if not present for testing purposes,
// or rely on the user having it.
// For this test script, we will just try to run it.

async function run() {
  console.log("Testing getDispositifs...");
  try {
    if (!process.env.MONGODB_URI) {
      console.warn(
        "Warning: MONGODB_URI is not set. This test might fail if not running against a real DB.",
      );
    }
    const results = await getDispositifs();
    console.log(`Successfully fetched ${results.length} dispositifs.`);
    if (results.length > 0) {
      console.log("Sample result:", JSON.stringify(results[0], null, 2));
    }
  } catch (error) {
    console.error("Error running getDispositifs:", error);
  }
}

run();
