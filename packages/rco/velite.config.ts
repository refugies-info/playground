import { defineConfig, s } from "velite";

export default defineConfig({
  root: "content",
  collections: {
    formations: {
      name: "Formation",
      pattern: "formations/**/*.md",
      schema: s.object({
        lheo: s
          .object({
            "offre-formation": s
              .object({
                formation: s
                  .object({
                    "intitule-formation": s.string(),
                    "objectif-formation": s.string(),
                    "contenu-formation": s.string().optional(),
                  })
                  .passthrough(),
              })
              .passthrough(),
          })
          .passthrough(),
        content: s.markdown(),
      }),
    },
  },
});
