// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Route handler tests for POST /api/agents/metadata/stream.
 *
 * The route previously started an AI generation from an unauthenticated request
 * and persisted whatever the last stream fragment contained. These tests pin the
 * new contract: authenticated + authorized callers only, and the persisted
 * content is the complete accumulated response.
 */

const getCurrentUser = vi.fn();
const verifyWorkflowPermission = vi.fn();
const single = vi.fn();
const eq = vi.fn();
const select = vi.fn();
const from = vi.fn();
const startWorkflow = vi.fn();
const generateMetadataReport = vi.fn();
const createLettaClient = vi.fn(() => ({}));
const getRunUsage = vi.fn();
const matterStringify = vi.fn((content: string) => content);

vi.mock("@/lib/auth", () => ({
  getCurrentUser: (...a: unknown[]) => getCurrentUser(...a),
}));
vi.mock("@/services/permission-helper", () => ({
  verifyWorkflowPermission: (...a: unknown[]) => verifyWorkflowPermission(...a),
}));
vi.mock("@playground/supabase", () => ({
  getSupabaseAdmin: () => ({ from }),
  createSupabaseServerClient: () => ({ from }),
}));
vi.mock("next/headers", () => ({
  cookies: async () => ({}),
}));
vi.mock("@playground/shared-types", () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));
vi.mock("@playground/agents", () => ({
  createLettaClient: () => createLettaClient(),
  generateMetadataReport: (...a: unknown[]) => generateMetadataReport(...a),
  getRunUsage: (...a: unknown[]) => getRunUsage(...a),
}));
vi.mock("@playground/workflows", () => ({
  persistMetadataWorkflow: "persistMetadataWorkflow",
}));
vi.mock("@workflow/core/runtime", () => ({
  start: (...a: unknown[]) => startWorkflow(...a),
}));
vi.mock("gray-matter", () => ({
  default: {
    stringify: (...a: unknown[]) => matterStringify(...(a as [string])),
  },
}));

const WORKFLOW_ID = "11111111-1111-1111-1111-111111111111";

/**
 * Builds the exception Next.js throws from `redirect()`: an Error whose digest
 * encodes the destination. The route tells /login (no session) apart from
 * /service-unavailable (auth backend down) by reading that digest.
 */
function redirectError(destination: string): Error {
  const error = new Error("NEXT_REDIRECT") as Error & { digest: string };
  error.digest = `NEXT_REDIRECT;replace;${destination};307;`;
  return error;
}

function makeRequest(body: unknown) {
  return {
    json: async () => body,
  } as unknown as Parameters<typeof import("../route")["POST"]>[0];
}

/** Reads an SSE Response body fully and returns the parsed events. */
async function readEvents(response: Response): Promise<unknown[]> {
  const text = await response.text();
  return text
    .split("\n\n")
    .filter((block) => block.startsWith("data: "))
    .map((block) => block.replace("data: ", "").trim())
    .filter((payload) => payload !== "[DONE]")
    .map((payload) => JSON.parse(payload));
}

describe("POST /api/agents/metadata/stream", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.PLAYGROUND_AGENT_ID = "agent-test";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";

    getCurrentUser.mockResolvedValue({ id: "user-1", role: "editor" });
    verifyWorkflowPermission.mockResolvedValue(true);

    from.mockReturnValue({ select });
    select.mockReturnValue({ eq });
    eq.mockReturnValue({ single });
    single.mockResolvedValue({
      data: {
        conversation_id: "conv-1",
        editorial_record_id: null,
        ingestion_record_id: null,
      },
      error: null,
    });

    getRunUsage.mockResolvedValue(undefined);
    startWorkflow.mockResolvedValue(undefined);
  });

  it("rejects an unauthenticated caller without starting a generation", async () => {
    // getCurrentUser signals "no session" with a redirect("/login") exception.
    getCurrentUser.mockRejectedValue(redirectError("/login"));
    const { POST } = await import("../route");

    const response = await POST(
      makeRequest({ flowId: WORKFLOW_ID, content: "x" }),
    );

    expect(response.status).toBe(401);
    expect(generateMetadataReport).not.toHaveBeenCalled();
    expect(startWorkflow).not.toHaveBeenCalled();
  });

  it("reports an unreachable auth backend as 503, not as a failed login", async () => {
    // getCurrentUser redirects to /service-unavailable when Supabase is down or
    // the profile is unreadable. Mapping that to 401 would hide an outage.
    getCurrentUser.mockRejectedValue(redirectError("/service-unavailable"));
    const { POST } = await import("../route");

    const response = await POST(
      makeRequest({ flowId: WORKFLOW_ID, content: "x" }),
    );

    expect(response.status).toBe(503);
    expect(generateMetadataReport).not.toHaveBeenCalled();
    expect(startWorkflow).not.toHaveBeenCalled();
  });

  it("treats an unexpected auth failure as unauthenticated rather than crashing", async () => {
    getCurrentUser.mockRejectedValue(new Error("boom"));
    const { POST } = await import("../route");

    const response = await POST(
      makeRequest({ flowId: WORKFLOW_ID, content: "x" }),
    );

    expect(response.status).toBe(401);
    expect(startWorkflow).not.toHaveBeenCalled();
  });

  it("rejects a caller without permission on the workflow", async () => {
    verifyWorkflowPermission.mockResolvedValue(false);
    const { POST } = await import("../route");

    const response = await POST(
      makeRequest({ flowId: WORKFLOW_ID, content: "x" }),
    );

    expect(response.status).toBe(403);
    expect(generateMetadataReport).not.toHaveBeenCalled();
    expect(startWorkflow).not.toHaveBeenCalled();
  });

  it("persists the whole accumulated response, not the last fragment", async () => {
    generateMetadataReport.mockImplementation(async function* () {
      yield {
        message_type: "assistant_message",
        content: "foo",
        run_id: "run-1",
      };
      yield { message_type: "assistant_message", content: "bar" };
    });
    const { POST } = await import("../route");

    const response = await POST(
      makeRequest({ flowId: WORKFLOW_ID, content: "x" }),
    );
    await readEvents(response);

    expect(startWorkflow).toHaveBeenCalledTimes(1);
    const persistedContent = startWorkflow.mock.calls[0][1][2];
    expect(persistedContent).toBe("foobar");
  });

  it("streams progressive fragments to the client", async () => {
    generateMetadataReport.mockImplementation(async function* () {
      yield { message_type: "assistant_message", content: "foo" };
      yield { message_type: "assistant_message", content: "bar" };
    });
    const { POST } = await import("../route");

    const response = await POST(
      makeRequest({ flowId: WORKFLOW_ID, content: "x" }),
    );
    const events = (await readEvents(response)) as { content: string }[];

    expect(events.map((event) => event.content)).toEqual(["foo", "bar"]);
  });

  it("does not silently succeed when persistence cannot start", async () => {
    generateMetadataReport.mockImplementation(async function* () {
      yield { message_type: "assistant_message", content: "foo" };
    });
    startWorkflow.mockRejectedValue(new Error("workflow unavailable"));
    const { POST } = await import("../route");

    const response = await POST(
      makeRequest({ flowId: WORKFLOW_ID, content: "x" }),
    );
    const text = await response.text();

    // The client must be able to tell that the result was not persisted.
    expect(text).toContain('"type":"error"');
  });

  it("exposes no flow when the content is unknown", async () => {
    generateMetadataReport.mockImplementation(async function* () {
      // no assistant fragment at all
    });
    const { POST } = await import("../route");

    const response = await POST(
      makeRequest({ flowId: WORKFLOW_ID, content: "x" }),
    );
    const text = await response.text();

    expect(startWorkflow).not.toHaveBeenCalled();
    expect(text).toContain('"type":"error"');
  });
});
