const EMBED_TITLE = "Widget Refugies.info";
const FALLBACK_HEIGHT_IN_PX = 800;

export const buildEmbedUrl = (baseUrl: string, publicId: string) =>
  `${baseUrl.replace(/\/$/, "")}/w/${publicId}`;

const buildResizeScriptUrl = (embedUrl: string) =>
  embedUrl.replace(/\/w\/[^/]+$/, "/embed.js");

export const buildEmbedCode = (embedUrl: string) =>
  [
    `<iframe src="${embedUrl}" title="${EMBED_TITLE}" width="100%" height="${FALLBACK_HEIGHT_IN_PX}" style="border:0" allow="geolocation" loading="lazy"></iframe>`,
    `<script src="${buildResizeScriptUrl(embedUrl)}" async></script>`,
  ].join("\n");
