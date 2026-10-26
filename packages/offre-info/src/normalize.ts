import { z } from "zod";
import {
  SESSION_OFFRE_ARRAY_FIELDS,
  SESSION_OFFRE_FIELDS,
  type SessionOffre,
  type SessionOffreField,
} from "./session-offre";

const RawSessionSchema = z
  .object({ id: z.string(), numero_action: z.string() })
  .passthrough();

const COORDINATE_KEYS = new Set(["latitude", "longitude"]);

const toSnakeCaseKey = (key: string) => key.replaceAll("-", "_");

const toCoordinate = (value: string) => {
  const coordinate = Number(value);
  return Number.isFinite(coordinate) ? coordinate : null;
};

function normalizeValue(value: unknown, key?: string): unknown {
  if (Array.isArray(value)) return value.map((item) => normalizeValue(item));
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([rawKey, nested]) => {
        const snakeKey = toSnakeCaseKey(rawKey);
        return [snakeKey, normalizeValue(nested, snakeKey)];
      }),
    );
  }
  if (key && COORDINATE_KEYS.has(key) && typeof value === "string") {
    return toCoordinate(value);
  }
  return value;
}

const toArray = (value: unknown): unknown[] => {
  if (value === null || value === undefined) return [];
  return Array.isArray(value) ? value : [value];
};

export function normalizeSession(
  raw: unknown,
  fields: readonly SessionOffreField[] = SESSION_OFFRE_FIELDS,
): SessionOffre {
  const normalized = normalizeValue(RawSessionSchema.parse(raw)) as Record<
    string,
    unknown
  >;
  const session: Record<string, unknown> = Object.fromEntries(
    fields.map((field) => [field, normalized[field] ?? null]),
  );
  for (const field of SESSION_OFFRE_ARRAY_FIELDS) {
    if (field in session) session[field] = toArray(session[field]);
  }
  return session as SessionOffre;
}
