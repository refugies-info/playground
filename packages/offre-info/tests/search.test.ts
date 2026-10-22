import { describe, expect, it, vi } from "vitest";
import { fetchActionSessions } from "../src/action";
import type { RcoClient } from "../src/client";
import { searchActionSessions } from "../src/search";
import { rawSession } from "./fixtures";

const page = (numbers: string[], total: number) => ({
  total,
  page: 1,
  limit: 2,
  results: numbers.map((numero_action, index) => ({
    id: `${numero_action}-${index}`,
    numero_action,
  })),
});

const fakeClient = (
  responses: unknown[],
): RcoClient & { get: ReturnType<typeof vi.fn> } => {
  const get = vi.fn();
  for (const response of responses) get.mockResolvedValueOnce(response);
  return { get };
};
describe("searchActionSessions", () => {
  it("paginates until total and groups sessions by action", async () => {
    const client = fakeClient([page(["A", "A"], 3), page(["B"], 3)]);
    const actions = await searchActionSessions(client);
    expect(
      actions.map(({ numeroAction, sessions }) => [
        numeroAction,
        sessions.length,
      ]),
    ).toEqual([
      ["A", 2],
      ["B", 1],
    ]);
    expect(client.get).toHaveBeenCalledTimes(2);
    expect(client.get.mock.calls[0]?.[1]).toMatchObject({
      codes_operator: "OR",
      code_financeur: "2,3,8,9,11,12,13,15,19",
      formacode: "15235,15281,15043,15242",
      limit: 1000,
      page: 1,
    });
  });

  it("keeps only the search fields and marks sessions conventionnées", async () => {
    const [action] = await searchActionSessions(fakeClient([page(["A"], 1)]));
    const session = action?.sessions[0];
    expect(session?.conventionnement).toBe(true);
    expect(session?.code_public_vise).toEqual([]);
    expect(session).not.toHaveProperty("contenu_formation");
  });
});

describe("fetchActionSessions", () => {
  it("returns [] when the action no longer exists (404)", async () => {
    await expect(fetchActionSessions(fakeClient([null]), "A")).resolves.toEqual(
      [],
    );
  });

  it("normalizes each session", async () => {
    const sessions = await fetchActionSessions(
      fakeClient([[rawSession()]]),
      "01_AL1954732",
    );
    expect(sessions[0]?.prix_total_TTC).toBeNull();
  });
});
