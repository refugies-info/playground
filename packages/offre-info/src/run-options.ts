import { z } from "zod";
import { RCO_SEARCH_PAGE_LIMIT } from "./config";

export const RcoRunOptionsSchema = z.object({
  dryRun: z.boolean().default(true),
  maxActions: z
    .union([z.number().int().positive(), z.literal("all")])
    .default(20),
  pageSize: z.number().int().min(1).max(RCO_SEARCH_PAGE_LIMIT).default(100),
  // Only this /recherche page, instead of paginating.
  searchPage: z.number().int().positive().optional(),
  // Skip /recherche and ingest these actions only.
  numeroActions: z.array(z.string().min(1)).min(1).optional(),
  resumeRunId: z.string().uuid().optional(),
});

export type RcoRunOptions = z.infer<typeof RcoRunOptionsSchema>;

// Options used by the "Lancer l'import RCO" button. Edit here to test a
// given page or action; switch to { dryRun: false, maxActions: "all",
// pageSize: 1000 } only once small runs are validated.
export const RCO_RUN_OPTIONS: z.input<typeof RcoRunOptionsSchema> = {
  dryRun: true,
  maxActions: 20,
  pageSize: 100,
  numeroActions: [
    "01_GE1912267",
    "02_00375614",
    "14_SE_0001694172",
    "14_SE_0001856985",
    "01_GE2051036",
    "02_00511953",
    "20_758839S",
  ],
};
