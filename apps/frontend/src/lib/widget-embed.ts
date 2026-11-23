const EMBED_TITLE = "Widget Refugies.info";
const EMBED_HEIGHT_IN_PX = 800;

export const buildEmbedUrl = (baseUrl: string, publicId: string) =>
  `${baseUrl.replace(/\/$/, "")}/w/${publicId}`;

export const buildEmbedCode = (embedUrl: string) =>
  `<iframe src="${embedUrl}" title="${EMBED_TITLE}" width="100%" height="${EMBED_HEIGHT_IN_PX}" style="border:0" allow="geolocation" loading="lazy"></iframe>`;
