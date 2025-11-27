import type { Document } from "mongodb";

export const getDispositifsPipeline = (): Document[] => [
  // 1. Filter first (Standard best practice)
  {
    $match: { status: "Actif" },
  },

  // 2. SAFER LOOKUP: This limits matches to exactly 1 per document
  {
    $lookup: {
      from: "structures",
      let: { sponsorId: "$mainSponsor" }, // Define variable from local field
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$oid", "$$sponsorId"] }, // Match foreign field to variable
          },
        },
        { $limit: 1 }, // <--- THE KEY FIX: Stop looking after 1 match
        { $project: { nom: 1, acronyme: 1, _id: 0 } }, // Optimization: Only fetch needed fields
      ],
      as: "mainSponsorInfo",
    },
  },

  // 3. Unwind (Now safe because array size is always 0 or 1)
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
      titreInformatif: "$translations.fr.content.titreInformatif",
      titreMarque: "$translations.fr.content.titreMarque",
      location: "$metadatas.location",

      // Clean Array Logic
      city: {
        $filter: {
          input: { $ifNull: ["$map.city", []] },
          as: "item",
          cond: { $ne: ["$$item", null] },
        },
      },

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
