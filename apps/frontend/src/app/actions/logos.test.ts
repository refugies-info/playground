// @vitest-environment node
// jsdom's Blob/File don't implement arrayBuffer() (only slice/size/type),
// so this server-action test runs in the Node environment instead.
import { beforeEach, describe, expect, it, vi } from "vitest";

const uploadImageFromFormData = vi.fn();
const getCurrentUser = vi.fn();
const verifyWorkflowPermission = vi.fn();

vi.mock("@playground/cloudinary", () => ({
  uploadImageFromFormData: (...a: unknown[]) => uploadImageFromFormData(...a),
}));
vi.mock("@playground/supabase", () => ({
  createSupabaseServerClient: () => ({}),
}));
vi.mock("next/headers", () => ({
  cookies: async () => ({}),
}));
vi.mock("@/lib/auth", () => ({
  getCurrentUser: (...a: unknown[]) => getCurrentUser(...a),
}));
vi.mock("@/services/permission-helper", () => ({
  verifyWorkflowPermission: (...a: unknown[]) => verifyWorkflowPermission(...a),
}));
vi.mock("@playground/shared-types", () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

function makeFile(type: string, size: number): File {
  const blob = new Blob([new Uint8Array(size)], { type });
  return new File([blob], "logo.png", { type });
}

const UUID = "22222222-2222-2222-2222-222222222222";
const SECURE_URL =
  "https://res.cloudinary.com/demo/image/upload/v1/bomo_logos/x.png";

describe("uploadMetadataLogo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCurrentUser.mockResolvedValue({ id: "user-1", role: "editor" });
    verifyWorkflowPermission.mockResolvedValue(true);
    uploadImageFromFormData.mockResolvedValue({ secureUrl: SECURE_URL });
  });

  it("uploads into bomo_logos without cropping and returns the url", async () => {
    const { uploadMetadataLogo } = await import("./logos");
    const fd = new FormData();
    fd.set("file", makeFile("image/png", 1000));

    const result = await uploadMetadataLogo(UUID, fd);

    expect(uploadImageFromFormData).toHaveBeenCalledWith(
      fd,
      expect.objectContaining({
        folder: "bomo_logos",
        publicId: UUID,
        overwrite: true,
        transformation: {
          width: 512,
          height: 512,
          crop: "limit",
          quality: "auto",
        },
      }),
    );
    // Un logo garde son format d'origine : pas de conversion imposée.
    expect(uploadImageFromFormData.mock.calls[0]?.[1]).not.toHaveProperty(
      "format",
    );
    expect(result.secureUrl).toBe(SECURE_URL);
  });

  it("rejects a non-uuid workflowId before touching Cloudinary", async () => {
    const { uploadMetadataLogo } = await import("./logos");
    const fd = new FormData();
    fd.set("file", makeFile("image/png", 1000));

    await expect(uploadMetadataLogo("not-a-uuid", fd)).rejects.toThrow(
      /identifiant/i,
    );
    expect(uploadImageFromFormData).not.toHaveBeenCalled();
  });

  it("refuses a user without write permission on the workflow", async () => {
    verifyWorkflowPermission.mockResolvedValueOnce(false);
    const { uploadMetadataLogo } = await import("./logos");
    const fd = new FormData();
    fd.set("file", makeFile("image/png", 1000));

    await expect(uploadMetadataLogo(UUID, fd)).rejects.toThrow(/permission/i);
    expect(uploadImageFromFormData).not.toHaveBeenCalled();
  });

  it("checks the permission against the current user and workflow", async () => {
    getCurrentUser.mockResolvedValueOnce({ id: "user-9", role: "translator" });
    const { uploadMetadataLogo } = await import("./logos");
    const fd = new FormData();
    fd.set("file", makeFile("image/png", 1000));

    await uploadMetadataLogo(UUID, fd);

    expect(verifyWorkflowPermission).toHaveBeenCalledWith(
      expect.anything(),
      UUID,
      "user-9",
      "translator",
    );
  });
});
