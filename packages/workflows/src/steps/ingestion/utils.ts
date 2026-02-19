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
