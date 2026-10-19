import { z } from "zod";
import type { RcoClient } from "./client";
import {
  RCO_CERTIFINFO_CODES,
  RCO_CONVENTIONNEMENT,
  RCO_FORMACODES,
  RCO_SEARCH_PAGE_LIMIT,
} from "./config";

const SearchPageSchema = z.object({
  total: z.number(),
  limit: z.number(),
  results: z.array(z.object({ numero_action: z.string() })),
});

export async function searchActionNumbers(
  client: RcoClient,
  {
    page,
    pageSize = RCO_SEARCH_PAGE_LIMIT,
    maxActions,
  }: { page?: number; pageSize?: number; maxActions?: number } = {},
): Promise<string[]> {
  const actionNumbers = new Set<string>();

  for (let currentPage = page ?? 1; ; currentPage++) {
    const response = SearchPageSchema.parse(
      await client.get("/recherche", {
        formacode: RCO_FORMACODES.join(","),
        certifinfo: RCO_CERTIFINFO_CODES.join(","),
        conventionnement: RCO_CONVENTIONNEMENT,
        codes_operator: "OR",
        fields: "numero_action",
        limit: pageSize,
        page: currentPage,
      }),
    );
    for (const result of response.results)
      actionNumbers.add(result.numero_action);

    if (maxActions !== undefined && actionNumbers.size >= maxActions) {
      return [...actionNumbers].slice(0, maxActions);
    }
    const isLastPage =
      response.results.length === 0 ||
      currentPage * response.limit >= response.total;
    if (page !== undefined || isLastPage) return [...actionNumbers];
  }
}
