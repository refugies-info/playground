import {
  actionToMarkdown,
  buildActionDocument,
  normalizeSession,
} from "@playground/rco-offre-info";
import { SOURCE_MODEL_HANDLE } from "@playground/shared-types";
import { FatalError } from "@workflow/errors";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { rawSession } from "../../rco-offre-info/tests/fixtures";
import { getEditorialSource } from "../src/steps/sources";

const DETAIL = buildActionDocument([normalizeSession(rawSession())], "s");
const STRUCTURE = { id: "s" } as never;

const mocks = vi.hoisted(() => {
  const eq = vi.fn(async () => ({ error: null }));
  const update = vi.fn(() => ({ eq }));
  return {
    eq,
    update,
    createLettaClient: vi.fn(() => ({})),
    askMetadataAgent: vi.fn(),
    askPlainLanguageAgent: vi.fn(),
    askComplianceAgent: vi.fn(),
    fetchActionDetail: vi.fn(),
  };
});

vi.mock("@playground/agents", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  createLettaClient: mocks.createLettaClient,
  askMetadataAgent: mocks.askMetadataAgent,
  askPlainLanguageAgent: mocks.askPlainLanguageAgent,
  askComplianceAgent: mocks.askComplianceAgent,
}));
vi.mock("@playground/rco-offre-info", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  getRcoClientFromEnv: () => ({}),
  fetchActionDetail: mocks.fetchActionDetail,
}));
vi.mock("../src/steps/ingestion/utils", () => ({
  getSupabaseClient: () => ({ from: () => ({ update: mocks.update }) }),
}));

describe("getEditorialSource", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    mocks.fetchActionDetail.mockResolvedValue(DETAIL);
  });

  it.each(["DI", null, undefined, "constructor"])(
    "%s has no editorial source",
    (origin) => {
      expect(getEditorialSource(origin)).toBeUndefined();
    },
  );

  it("RCO defaults to the RCO model", () => {
    expect(getEditorialSource("RCO")?.defaultModel).toBe(SOURCE_MODEL_HANDLE);
  });

  it("metadata without model asks the agent with SOURCE_MODEL_HANDLE", async () => {
    vi.stubEnv("RCO_METADATA_AGENT_ID", "agent-meta");
    mocks.askMetadataAgent.mockResolvedValue({
      answer: { fields: [] },
      usage: {},
    });
    await getEditorialSource("RCO")?.generateMetadata({
      serviceData: { id: "x" },
    });
    expect(mocks.fetchActionDetail).toHaveBeenCalledWith({}, { id: "x" });
    expect(mocks.askMetadataAgent.mock.calls[0].at(-1)).toBe(
      SOURCE_MODEL_HANDLE,
    );
  });

  it("plain language without model uses SOURCE_MODEL_HANDLE", async () => {
    vi.stubEnv("RCO_PLAIN_LANGUAGE_AGENT_ID", "agent-pl");
    mocks.askPlainLanguageAgent.mockResolvedValue({
      answer: {
        title: "t",
        description: "d",
        goodToKnow: [],
        why: [],
        how: [],
        otherInfo: [],
        lexicon: [],
        warnings: [],
      },
      usage: {},
      conversationId: "c",
    });
    const linkConversation = vi.fn(async () => {});
    await getEditorialSource("RCO")?.generatePlainLanguage({
      serviceData: { id: "x" },
      linkConversation,
    });
    const args = mocks.askPlainLanguageAgent.mock.calls[0];
    expect(args[4]).toBe(SOURCE_MODEL_HANDLE);
    expect(args[5]).toBe(linkConversation);
  });

  it("arbitration saves the detail before checking the agent env", async () => {
    vi.stubEnv("RCO_COMPLIANCE_AGENT_ID", "");
    await expect(
      getEditorialSource("RCO")?.arbitrate({
        ingestionRecordId: "rec-1",
        metadata: { structure: STRUCTURE },
        serviceData: { id: "x" },
        workflowId: "wf-1",
      }),
    ).rejects.toBeInstanceOf(FatalError);
    expect(mocks.update).toHaveBeenCalledWith({
      markdown: actionToMarkdown(DETAIL, STRUCTURE),
      metadata: { ...DETAIL, structure: STRUCTURE },
    });
    expect(mocks.eq).toHaveBeenCalledWith("id", "rec-1");
    expect(mocks.askComplianceAgent).not.toHaveBeenCalled();
  });
});
