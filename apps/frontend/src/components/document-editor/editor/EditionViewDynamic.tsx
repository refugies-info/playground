"use client";

import dynamic from "next/dynamic";

// `ssr: false` est interdit dans un Server Component (App Router).
// Ce wrapper Client Component permet de lazy-loader BlockNote (~400-600KB)
// sans impacter le bundle initial de la page.
export const EditionViewDynamic = dynamic(
  () => import("./EditionView").then((m) => m.EditionView),
  { ssr: false },
);
