import { parseLheoXml } from "./lheo";
import type { LheoDocument } from "./lheo-types";

/**
 * Splits an LHEO XML content into multiple LHEO JSON objects,
 * one for each 'action' found in the formations.
 *
 * Each returned object effectively represents a "Single Action Formation".
 * It keeps the global context (offres -> formation -> ... -> action[i]).
 *
 * If a formation has multiple actions, it produces N objects.
 * If a formation has 1 action, it produces 1 object.
 * If a formation has no action, it produces 1 object with no action (or 0?).
 *
 * Typically LHEO structure is:
 * lheo -> offres -> formation[] -> action[]
 *
 * We will flatten this to a list of LHEO documents where:
 * lheo -> offres -> formation[1] -> action[1]
 */
export const splitLheoXmlIntoActions = async (
  xmlContent: string,
): Promise<LheoDocument[]> => {
  const doc = await parseLheoXml(xmlContent);
  const results: LheoDocument[] = [];

  if (!doc.lheo || !doc.lheo.offres || !doc.lheo.offres.formation) {
    // If invalid structure or empty, just return the doc as is
    return [doc];
  }

  // Ensure formation is an array (our parsing config might handle this, but being safe)
  const formations = Array.isArray(doc.lheo.offres.formation)
    ? doc.lheo.offres.formation
    : [doc.lheo.offres.formation];

  for (const formation of formations) {
    const actions = formation.action;

    if (!actions || actions.length === 0) {
      // Keep formation even if no action?
      // Requirement says "array of action elements ... 1 to N relationship".
      // If there are no actions, we might still want to keep the formation record?
      // For now let's assume we keep it as is.
      const newDoc = JSON.parse(JSON.stringify(doc)); // Deep copy
      newDoc.lheo.offres.formation = [JSON.parse(JSON.stringify(formation))];
      results.push(newDoc);
      continue;
    }

    // Iterate over actions
    const actionList = Array.isArray(actions) ? actions : [actions];

    for (const action of actionList) {
      // Create a deep copy of the doc structure for this specific action
      // We want to reconstruct the tree:
      // newDoc
      //   .lheo
      //     .offres
      //       .formation = [ { ...formationWithoutActions, action: [thisAction] } ]

      // 1. Clone the whole doc? efficient enough for typical XML sizes
      const newDoc: LheoDocument = JSON.parse(JSON.stringify(doc));

      // 2. Clear formations in the clone
      newDoc.lheo.offres.formation = [];

      // 3. Clone formation but set action to just this one
      // We use JSON parse/stringify to ensure a deep copy, preventing shared references
      // for nested objects like domaine-formation
      const singleActionFormation = JSON.parse(
        JSON.stringify({ ...formation, action: [action] }),
      );

      // 4. Add to newDoc
      newDoc.lheo.offres.formation.push(singleActionFormation);

      results.push(newDoc);
    }
  }

  return results;
};
