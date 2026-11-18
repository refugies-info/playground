import { computeContentHash } from "@playground/supabase/ingestion-runs";
import { describe, expect, it } from "vitest";
import { normalizeSession } from "../src/api/normalize";
import type { RcoActionSessions } from "../src/api/search";
import { toOriginId } from "../src/config";
import { buildActionDocument } from "../src/lheo/document";
import { buildStructureDocument } from "../src/lheo/structure";
import { rcoProvider } from "../src/provider";
import { rawSession } from "./fixtures";

type Row = Record<string, unknown>;
type Call = {
  table: string;
  op: "select" | "insert" | "delete";
  filter?: [string, unknown[]];
  rows?: Row[];
};

// Mimics only the chains the generic writer makes: select().in(), insert().select(), delete().in().
function fakeSupabase(tables: Record<string, Row[]>, failingInsert?: string) {
  const calls: Call[] = [];
  let uuid = 0;
  const from = (table: string) => {
    const call: Call = { table, op: "select" };
    const answer = () => {
      if (call.op === "insert") {
        if (table === failingInsert) {
          return { data: null, error: { message: `${table} down` } };
        }
        return {
          data: (call.rows ?? []).map((row) => ({
            id: `${table}-uuid-${++uuid}`,
            origin_id: (row.data as Row | undefined)?.id ?? null,
          })),
          error: null,
        };
      }
      if (call.op === "delete") return { data: null, error: null };
      const [column, values] = call.filter ?? ["", []];
      const key = column === "data->>siret" ? "siret" : column;
      return {
        data: (tables[table] ?? []).filter((row) => values.includes(row[key])),
        error: null,
      };
    };
    const query = {
      select: () => query,
      insert: (rows: Row[]) =>
        Object.assign(call, { op: "insert", rows }) && query,
      delete: () => Object.assign(call, { op: "delete" }) && query,
      in: (column: string, values: unknown[]) =>
        Object.assign(call, { filter: [column, values] }) && query,
      // biome-ignore lint/suspicious/noThenProperty: awaitable query builder, like supabase-js
      then: (
        resolve: (value: unknown) => unknown,
        reject: (error: unknown) => unknown,
      ) => {
        calls.push(call);
        return Promise.resolve(answer()).then(resolve, reject);
      },
    };
    return query;
  };
  return {
    client: { from } as unknown as Parameters<
      typeof rcoProvider.ingestBatch
    >[0],
    calls,
  };
}

const STRUCTURE_KNOWN = "carif-oref--siret-00000000000001";
const baseOrganisme = normalizeSession(rawSession()).organisme_responsable;

const sessionsOf = (
  numeroAction: string,
  overrides: Record<string, unknown> = {},
): RcoActionSessions["sessions"] => [
  normalizeSession(
    rawSession({
      numero_action: numeroAction,
      id: `id-${numeroAction}`,
      ...overrides,
    }),
  ),
];

const action = (
  numeroAction: string,
  overrides: Record<string, unknown> = {},
): RcoActionSessions => ({
  numeroAction,
  sessions: sessionsOf(numeroAction, overrides),
});

const ACTION_NEW = action("A-new", {
  organisme_responsable: {
    ...rawSession().organisme_responsable,
    siret: "00000000000002",
  },
});
const ACTION_UNCHANGED = action("A-unchanged");
const ACTION_BASELINE = action("A-baseline");
const ACTION_SESSIONS = action("A-sessions");
const ACTION_CONTENT = action("A-content");
const ACTION_NOSIRET = action("A-nosiret", {
  organisme_responsable: { nom: "Sans SIRET" },
});
const ACTION_NOTCONV = action("A-notconv", { conventionnement: false });

const ALL_ACTIONS = [
  ACTION_NEW,
  ACTION_UNCHANGED,
  ACTION_BASELINE,
  ACTION_SESSIONS,
  ACTION_CONTENT,
  ACTION_NOSIRET,
  ACTION_NOTCONV,
];

const documentOf = ({ sessions }: RcoActionSessions) =>
  buildActionDocument(sessions, STRUCTURE_KNOWN);

const latestRow = (
  { numeroAction }: RcoActionSessions,
  origin: "DI" | "RCO",
  data: unknown,
  hash = computeContentHash(data),
) => ({
  origin_id: toOriginId(numeroAction),
  origin,
  data,
  content_hash: hash,
  structure_id: STRUCTURE_KNOWN,
});

const seed = {
  structures_latest: [
    {
      id: "structure-known-uuid",
      origin_id: STRUCTURE_KNOWN,
      siret: "00000000000001",
      content_hash: computeContentHash(
        buildStructureDocument(
          baseOrganisme as NonNullable<typeof baseOrganisme>,
          STRUCTURE_KNOWN,
        ),
      ),
    },
  ],
  services_latest: [
    latestRow(ACTION_UNCHANGED, "RCO", documentOf(ACTION_UNCHANGED)),
    latestRow(ACTION_BASELINE, "DI", { titre: "DI" }, "di"),
    latestRow(ACTION_SESSIONS, "RCO", {
      ...documentOf(ACTION_SESSIONS),
      sessions: [],
    }),
    latestRow(ACTION_CONTENT, "RCO", {
      ...documentOf(ACTION_CONTENT),
      nom: "Ancien",
    }),
  ],
};

describe("ingestRcoActions", () => {
  it("writes every change kind", async () => {
    const { client, calls } = fakeSupabase(seed);
    const result = await rcoProvider.ingestBatch(client, ALL_ACTIONS, "run-1");
    expect(result.changes).toEqual({
      new: 2,
      unchanged: 1,
      baseline: 1,
      sessions_only: 1,
      content: 1,
    });
    expect(result.errors).toEqual([
      {
        numeroAction: "A-nosiret",
        error: "organisme_responsable without siret",
      },
    ]);
    expect({ result, calls }).toMatchSnapshot();
  });

  it("rolls back services when ingestion_records fails", async () => {
    const { client, calls } = fakeSupabase(seed, "ingestion_records");
    const result = await rcoProvider.ingestBatch(client, [ACTION_NEW], "run-1");
    expect(calls.at(-1)).toMatchObject({ table: "services", op: "delete" });
    expect({ result, calls }).toMatchSnapshot();
  });

  it("skips the services insert when nothing changed", async () => {
    const { client, calls } = fakeSupabase(seed);
    const result = await rcoProvider.ingestBatch(
      client,
      [ACTION_UNCHANGED],
      "run-1",
    );
    expect(
      calls.some(({ table, op }) => table === "services" && op === "insert"),
    ).toBe(false);
    expect({ result, calls }).toMatchSnapshot();
  });

  it("does nothing for an empty batch", async () => {
    const { client, calls } = fakeSupabase(seed);
    const result = await rcoProvider.ingestBatch(client, [], "run-1");
    expect(result.processed).toBe(0);
    expect(calls).toEqual([]);
  });
});
