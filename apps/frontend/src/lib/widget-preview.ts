export type PreviewDevice = "desktop" | "mobile";

export const buildPreviewUrl = (
  baseUrl: string,
  publicId: string,
  version: number,
) => `${baseUrl.replace(/\/$/, "")}/w/${publicId}?preview=1&v=${version}`;
