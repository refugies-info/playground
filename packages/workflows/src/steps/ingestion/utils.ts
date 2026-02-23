import { getSupabaseAdmin } from "@playground/supabase";

export function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not defined");
  }

  return getSupabaseAdmin(url, key);
}

const DI_FETCH_PAGE_SIZE = 1000;

export async function fetchAllDiServiceIds(): Promise<string[]> {
  const supabase = getSupabaseClient();
  const serviceIds: string[] = [];
  let page = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from("di_services")
      .select("id")
      .range(page * DI_FETCH_PAGE_SIZE, (page + 1) * DI_FETCH_PAGE_SIZE - 1);

    if (error) {
      throw new Error(`Failed to fetch DI services: ${error.message}`);
    }

    if (!data || data.length === 0) {
      break;
    }

    for (const service of data) {
      serviceIds.push(String(service.id));
    }

    hasMore = data.length === DI_FETCH_PAGE_SIZE;
    page += 1;
  }

  return serviceIds;
}

// =============================================================================
// Concurrency helper
// =============================================================================

/**
 * Exécute un tableau de tâches async avec une limite de concurrence.
 * Fonctionne comme `Promise.allSettled` mais max `concurrency` tâches en parallèle.
 *
 * @param tasks      - Tableau de fonctions retournant une Promise
 * @param concurrency - Nombre max de tâches simultanées (défaut: 5)
 * @returns Tableau de résultats (fulfilled/rejected) dans le même ordre que `tasks`
 */
export async function runWithConcurrency<T>(
  tasks: (() => Promise<T>)[],
  concurrency = 5,
): Promise<PromiseSettledResult<T>[]> {
  const results: PromiseSettledResult<T>[] = new Array(tasks.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < tasks.length) {
      const idx = nextIndex++;
      try {
        const value = await tasks[idx]();
        results[idx] = { status: "fulfilled", value };
      } catch (reason) {
        results[idx] = { status: "rejected", reason };
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker()),
  );

  return results;
}
