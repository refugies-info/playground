import type { RiDispositifSummary } from "@playground/shared-types";
import { isDispositifId } from "@/lib/widget-form";
import {
  getDispositifsByIdsAction,
  searchDispositifsAction,
} from "@/services/widget-config-actions";

export const searchDispositifs = async (
  text: string,
): Promise<RiDispositifSummary[]> => {
  const result = isDispositifId(text)
    ? await getDispositifsByIdsAction([text.trim()])
    : await searchDispositifsAction(text);
  if (!result.success) throw new Error(result.error);
  return result.data;
};
