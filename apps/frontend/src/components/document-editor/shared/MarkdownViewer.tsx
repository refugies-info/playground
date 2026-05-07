import dynamic from "next/dynamic";

/**
 * Reusable component for rendering markdown content with BlockNote.
 *
 * Exporté via `dynamic({ ssr: false })` avec un vrai import() pour deux raisons :
 * 1. SSR désactivé — BlockNote accède à `window` au montage
 * 2. Code-splitting — @blocknote/* n'est pas inclus dans le bundle initial
 *
 * Les consommateurs importent `{ MarkdownViewer }` directement sans wrapper local.
 */
export const MarkdownViewer = dynamic(() => import("./MarkdownViewer.inner"), {
  ssr: false,
});
