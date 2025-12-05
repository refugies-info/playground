import { parseLheoXml } from "./lheo";

export interface JsonNode {
  tag: string;
  attrs: Record<string, string>;
  text?: string | null;
  children: JsonNode[];
}

const toStringValue = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  return String(value);
};

const normalizeToNode = (tag: string, value: unknown): JsonNode => {
  // If the value is a primitive, treat it as text content
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    value === null
  ) {
    return {
      tag,
      attrs: {},
      text: value === null ? null : toStringValue(value),
      children: [],
    };
  }

  if (Array.isArray(value)) {
    // Arrays represent repeated siblings; create a virtual parent to host them.
    const children = value.map((child) => normalizeToNode(tag, child));
    return { tag, attrs: {}, children };
  }

  if (typeof value === "object" && value !== null) {
    const record = value as Record<string, unknown>;

    const attrsRaw = record.attributes;
    const attrs: Record<string, string> = {};
    if (attrsRaw && typeof attrsRaw === "object") {
      for (const [k, v] of Object.entries(attrsRaw)) {
        if (v !== undefined && v !== null) {
          attrs[k] = toStringValue(v);
        }
      }
    }

    const textValue =
      "_text" in record
        ? record._text === null
          ? null
          : toStringValue(record._text)
        : undefined;

    const children: JsonNode[] = [];
    for (const [childKey, childValue] of Object.entries(record)) {
      if (childKey === "attributes" || childKey === "_text") continue;

      if (Array.isArray(childValue)) {
        for (const item of childValue) {
          children.push(normalizeToNode(childKey, item));
        }
      } else {
        children.push(normalizeToNode(childKey, childValue));
      }
    }

    return { tag, attrs, text: textValue, children };
  }

  // Fallback for unexpected types
  return { tag, attrs: {}, text: undefined, children: [] };
};

/**
 * Lossless, query-friendly representation: every node has {tag, attrs, text?, children[]}
 */
export const lheoXmlToJson = async (xmlString: string): Promise<JsonNode> => {
  const parsed = await parseLheoXml(xmlString);

  const children = Object.entries(parsed).map(([key, value]) =>
    normalizeToNode(key, value)
  );

  return {
    tag: "#document",
    attrs: {},
    children,
  };
};
