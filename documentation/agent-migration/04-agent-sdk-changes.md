# What Letta Agent SDK actually changes

> **Section §4 — reading of the official documentation as of 17/09/2026.**

---

## 4. What Letta Agent SDK actually changes

> Reading of the official documentation as of 17 September 2026: <https://docs.letta.com/agent-sdk>.

### 4.1 The runtime is an architectural choice, not a given

The SDK is an **interface** to an agent runtime. The backend determines where state and execution live:

| Goal | SDK configuration | Execution environment | Agent state |
|---|---|---|---|
| Agent and execution fully managed | `backend: "cloud"` | Managed sandbox | Letta Cloud |
| Hosted agent, execution on a machine you control | `backend: "cloud"` + `computer` | Selected machine | Letta Cloud |
| State and execution fully local | `backend: "local"` | Current machine | Current machine |
| Runtime that you operate | `backend: "remote"` | App Server machine | Depends on the App Server backend |

**Consequence to be evaluated explicitly (trade-off A/D):** with `backend: "cloud"`, tool execution takes place in a managed environment. **Client tools and MCP servers, however, run in the SDK's Node process** — a stdio MCP server therefore sees the host's filesystem, not the managed sandbox.

### 4.2 Agent, conversation and session are three distinct identities

- **Agent**: durable identity and memory.
- **Conversation**: persistent thread of work (`conv-xxx`).
- **Session**: active connection enabling `send()` then `stream()`.

`createAgent()` also creates the default conversation. `createSession(agentId)` opens a **new** conversation; `resumeSession(id)` accepts an `agent-xxx` (default conversation) or a `conv-xxx`.

> **Pitfall:** systematically resuming from the agent ID amounts to using the **default** conversation — that is not the right mechanism for isolating content records. The current code already persists conversation IDs (`workflows.conversation_id`): that is the right approach, to be generalized.

### 4.3 A network outage does not mean the generation did not happen

Documented guarantees and non-guarantees:

- Events missed during a disconnection **are not replayed**. Recovery goes through `listMessages()` or `bootstrapState()`.
- A session whose connection has closed **cannot be reused**: you must call `resumeSession(conversationId)`.
- **"If a connection fails after `send()` succeeded, do not retry blindly"** — the message may already have reached the runtime.
- The only recommended automatic retry is sandbox expiration **before** sending (`CloudManagedSandboxExpiredError`), with a new `resumeSession` and then a single additional attempt.

**Consequence:** the Playground must explicitly handle an "**uncertain result**" state. The SDK does not guarantee exactly-once business execution.

### 4.4 The terminal result must not be concatenated a second time

The stream emits `assistant` (and `reasoning`) fragments, then a terminal `result` event containing the complete final text, `success`, `stopReason`, `durationMs` and `runIds`.

Recommended contract:

- fragments → **progressive display**;
- successful `result` → **candidate content** for activation;
- mandatory business validation before activation;
- **never** concatenate the terminal text onto the fragments already assembled;
- no business success inferred from the closing of the stream alone.

> The existing parsing module (`packages/agents/src/parser.ts`) knows how to repair frontmatter whose closing `---` is missing. This is an asset to preserve, but it persists `parsed.data` and not the sanitized output of the schema: to be fixed (PR-12).

### 4.5 Permissions: a security lever usable server-side

- `permissionMode`: `standard` | `acceptEdits` | `unrestricted` | `strict`.
- `allowedTools`: an **availability** filter — if provided, it must list **all** the desired tools (client, MCP, built-in).
- `canUseTool`: decision per tool call (allow / deny / modify the input).

> **Operational warning:** a server agent must not remain blocked on an interactive approval. In non-interactive processing, use an explicit mode and tool list, with a restrictive default policy.

### 4.6 Message idempotence

`send()` accepts an `otid` supplied by the caller, which then appears on the persisted message: this is the mechanism intended to correlate an application-side send with the runtime message.

### 4.7 Memory: versioned ≠ reproducible behavior

- An agent's memory lives in a git repository owned by the agent; MemFS projects it onto the working machine.
- Files under `system/` are **in the system prompt on every turn**.
- The conversations of the same agent **share** its memory.

**Consequence (trade-off A):** changing the agent used by v1 during qualification can degrade the fallback **without any code change at all**. A knowledge release must be identified, controlled and restorable, and evaluation agents isolated from production.

### 4.8 Two important corrections relative to earlier plans

**a) Transitive dependency on the legacy client**
The published `@letta-ai/letta-agent-sdk` package **itself depends on `@letta-ai/letta-client`**. The exit criterion therefore cannot be "zero occurrences in the lockfile".

✅ Good criterion: *no direct application import or call to the old surface; the SDK's internal dependencies are tracked as transitive dependencies.*

**b) Version and publication delay**
At the time of the analysis (17/09/2026), on the npm registry:

- latest published version: `0.8.11` (16 September — **too recent** for the internal 7-day maturity policy);
- most recent version that already satisfies the delay: **`0.8.3`** (1 September).

To be re-checked at the effective start of phase 0. **The features described in the current documentation must be tested against the version actually retained** — not merely read. No automatic exception to the maturity policy.
