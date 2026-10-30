// Editorial thresholds of the RI compliance check. Edit these lists to tune
// the rules: the logic in compliance-rules.ts never hardcodes a value.

export { AUDIENCE_LABELS, FUNDER_LABELS } from "@playground/shared-types";

export const ACCEPTED_FUNDER_CODES = new Set([
  "2",
  "3",
  "8",
  "9",
  "11",
  "12",
  "13",
  "15",
  "19",
]);

export const ACCEPTED_AUDIENCE_CODES = new Set([
  "81019",
  "81021",
  "81022",
  "81023",
  "81042",
  "81043",
  "82060",
]);

export const MIN_SESSION_DAYS = 20;

export const MIN_TOTAL_HOURS = 20;
