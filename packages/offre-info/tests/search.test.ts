import { describe, expect, it, vi } from "vitest";
import { fetchActionSessions } from "../src/action";
import type { RcoClient } from "../src/client";
import { searchActionNumbers } from "../src/search";
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

describe("searchActionNumbers", () => {
  it("paginates until total and deduplicates sessions of the same action", async () => {
    const client = fakeClient([page(["A", "A"], 3), page(["B"], 3)]);
    await expect(searchActionNumbers(client, { pageSize: 2 })).resolves.toEqual(
      ["A", "B"],
    );
    expect(client.get).toHaveBeenCalledTimes(2);
    expect(client.get.mock.calls[0]?.[1]).toMatchObject({
      codes_operator: "OR",
      fields: "numero_action",
      formacode: "15235,15281,15043,15242",
      limit: 2,
      page: 1,
    });
  });

  it("loads only the requested page", async () => {
    const client = fakeClient([page(["C"], 10)]);
    await expect(
      searchActionNumbers(client, { page: 3, pageSize: 2 }),
    ).resolves.toEqual(["C"]);
    expect(client.get).toHaveBeenCalledTimes(1);
    expect(client.get.mock.calls[0]?.[1]).toMatchObject({ page: 3 });
  });

  it("stops early once maxActions is reached", async () => {
    const client = fakeClient([page(["A", "B"], 10)]);
    await expect(
      searchActionNumbers(client, { maxActions: 1 }),
    ).resolves.toEqual(["A"]);
    expect(client.get).toHaveBeenCalledTimes(1);
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
