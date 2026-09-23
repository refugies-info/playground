# Production rollback procedure

> **Section §7 — cases A to D, operational objectives and limits of the mechanism.**

---

## 7. Production rollback procedure

### Case A — Regression limited to one SDK flow

1. **Suspend** new operations of the affected flow.
2. List in-flight operations and the effects already produced.
3. Cancel them or let them finish depending on the state of each.
4. **Revoke their write access** if they are replaced or quarantined.
5. Select v1 for **new** operations.
6. Verify a reference generation and its business result.
7. Reopen gradually.

> **Never change the runtime in the middle of an existing operation.**

### Case B — Incorrect content already saved

1. Identify the affected results by operation / knowledge release.
2. Prevent their automatic selection.
3. Compare the current revision with the expected one.
4. Restore previous content, overrides and links **only in the absence of any later human edit**.
5. In case of conflict: offer a manual restore, never overwrite.
6. Verify that a later backup does not reactivate the wrong report.

> No global database restore for an isolated generation incident.

### Case C — Publication or external effect already carried out

- **Do not automatically replay** a publication.
- Verify the actual state on the RI / Airtable side and the local receipts.
- Explicitly correct the external effect.
- Keep the record of the operation and of the compensation.

> A Supabase transaction cannot undo a webhook that has already been accepted.

### Case D — The v1 path is no longer available

> ️ **This case is no longer an edge scenario: it is the expected scenario.**
> Luis confirmed on 17/09/2026 that there is no firm date for the API shutdown,
> but that it is **imminent**. The v1 fallback is therefore a **bridge whose duration is
> unknown and imposed from the outside**, not an option the project controls.

- Suspend AI generation.
- Preserve **manual** reading, editing and validation.
- Allow the publication of validated content if it does not depend on the failing processing.
- Keep the requests to be processed.
- Restore an SDK release / previously validated knowledge if that resolves the incident.

> The plan guarantees **degraded editorial continuity**; it cannot guarantee automatic AI continuity if both Letta paths are unavailable.

### Proposed operational objectives

| Objective | Provisional target |
|---|---|
| Suspend generations and change their routing | **≤ 5 minutes** |
| Establish the list of uncertain operations and decide | **≤ 30 minutes** |
| Data restore | Timeframe depending on scope, **without sacrificing human corrections** |
| Full cutover to the SDK | **before the shutdown announced by Letta** — see [§10](07-v1-removal-and-backup.md) |

> These objectives only become commitments after the PR-20 production-like rollback rehearsal.

### What rollback does not cover

| Effect | Undone by an application rollback? |
|---|---|
| RI publication webhook already accepted | ❌ |
| Airtable send already performed | ❌ |
| Translator assignment already written | ❌ |
| Translation already overwritten (without snapshot) | ❌ |
| Metadata overrides already cleared | ❌ |
| Letta memory already modified | ❌ |
| Reports already created | ⚠️ partially (quarantine required) |
| Vercel workflows in progress | ⚠️ cancellation required, verification required |
