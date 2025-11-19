/**
 * ContentFlag represents an AI quality assessment or manual override for a ContentItem.
 * Supports both AI-generated flags and human overrides per Principle 5 (Human-in-the-Loop).
 */
export interface ContentFlag {
  /** Unique identifier */
  id: string;
  /** Reference to ContentItem.id */
  contentId: string;
  /** Quality assessment result */
  flagStatus: "accepted" | "rejected";
  /** AI reasoning or explanation for the flag */
  aiReasoning: string;
  /** ISO timestamp of flag creation */
  createdAt: string;
  /** User ID if this is a manual override; null if AI-generated */
  createdBy: string | null;
  /** Reason for manual override (if createdBy is not null) */
  overrideReason: string | null;
}
