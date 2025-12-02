import type { Document } from "mongodb";

export const getDispositifsPipeline = (): Document[] => [
  // 1. Filter first
  {
    $match: { status: "Actif", typeContenu: "dispositif" },
  },

  // 2. LOOKUP (Fixed)
  {
    $lookup: {
      from: "structures",
      let: { sponsorId: "$mainSponsor" },
      pipeline: [
        {
          $match: {
            $expr: {
              // CRITICAL FIX: Use "$_id" (the actual DB field), not "$oid"
              $eq: ["$_id", "$$sponsorId"],
            },
          },
        },
        // Optimization: Stop after 1 match and only return what we need
        // This makes the query significantly faster
        { $limit: 1 },
        { $project: { nom: 1, acronyme: 1, _id: 0 } },
      ],
      as: "mainSponsorInfo",
    },
  },

  // 3. Unwind (Flattens the array created by lookup)
  {
    $unwind: {
      path: "$mainSponsorInfo",
      preserveNullAndEmptyArrays: true,
    },
  },

  // 4. Project (Clean flat structure)
  {
    $project: {
      _id: 0,
      id: { $toString: "$_id" },
      titreInformatif: "$translations.fr.content.titreInformatif",
      titreMarque: "$translations.fr.content.titreMarque",
      location: "$metadatas.location",

      // Keep your existing array logic
      city: {
        $filter: {
          input: { $ifNull: ["$map.city", []] },
          as: "item",
          cond: { $ne: ["$$item", null] },
        },
      },

      // Now these will populate correctly
      mainSponsorNom: "$mainSponsorInfo.nom",
      mainSponsorAcronyme: "$mainSponsorInfo.acronyme",
    },
  },
];

import { getMongoDb } from "./client";

export const getDispositifs = async (): Promise<Document[]> => {
  const db = await getMongoDb();
  const collection = db.collection("dispositifs");
  const pipeline = getDispositifsPipeline();
  return collection.aggregate(pipeline).toArray();
};
