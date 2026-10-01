// @vitest-environment node
// jsdom's Blob/File don't implement arrayBuffer() (only slice/size/type),
// so this server-action test runs in the Node environment instead.
import { beforeEach, describe, expect, it, vi } from "vitest";

const uploadImageFromFormData = vi.fn();
const assertAdmin = vi.fn();
const update = vi.fn();
const eq = vi.fn();
const from = vi.fn();
const revalidatePath = vi.fn();

// Le rejet des formats et des fichiers trop lourds appartient désormais à
// `uploadImageFromFormData`, couvert dans packages/cloudinary : ce test-ci ne
// vérifie plus que ce qui est propre à l'avatar.
vi.mock("@playground/cloudinary", () => ({
  uploadImageFromFormData: (...a: unknown[]) => uploadImageFromFormData(...a),
}));
vi.mock("@/lib/authz", () => ({
  assertAdmin: (...a: unknown[]) => assertAdmin(...a),
}));
vi.mock("@playground/supabase", () => ({
  getSupabaseAdmin: () => ({ from }),
}));
vi.mock("next/cache", () => ({
  revalidatePath: (...a: unknown[]) => revalidatePath(...a),
}));
vi.mock("@playground/shared-types", () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

function makeFile(type: string, size: number): File {
  const blob = new Blob([new Uint8Array(size)], { type });
  return new File([blob], "avatar.png", { type });
}

const UUID = "11111111-1111-1111-1111-111111111111";
const SECURE_URL =
  "https://res.cloudinary.com/demo/image/upload/bomo_avatars/z.webp";

describe("uploadAvatar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    from.mockReturnValue({ update });
    update.mockReturnValue({ eq });
    eq.mockResolvedValue({ error: null });
    uploadImageFromFormData.mockResolvedValue({ secureUrl: SECURE_URL });
  });

  it("uploads, writes avatar_url, revalidates, and returns the url", async () => {
    const { uploadAvatar } = await import("./avatars");
    const fd = new FormData();
    fd.set("file", makeFile("image/png", 1000));

    const result = await uploadAvatar(UUID, fd);

    expect(assertAdmin).toHaveBeenCalled();
    expect(uploadImageFromFormData).toHaveBeenCalledWith(
      fd,
      expect.objectContaining({
        folder: "bomo_avatars",
        publicId: UUID,
        overwrite: true,
        format: "webp",
        transformation: {
          width: 400,
          height: 400,
          crop: "fill",
          gravity: "auto",
          quality: "auto",
        },
      }),
    );
    expect(from).toHaveBeenCalledWith("profiles");
    expect(update).toHaveBeenCalledWith({ avatar_url: SECURE_URL });
    expect(eq).toHaveBeenCalledWith("id", UUID);
    expect(revalidatePath).toHaveBeenCalledWith("/users");
    expect(result.secureUrl).toContain("res.cloudinary.com");
  });

  it("rejects a non-uuid userId", async () => {
    const { uploadAvatar } = await import("./avatars");
    const fd = new FormData();
    fd.set("file", makeFile("image/png", 1000));
    await expect(uploadAvatar("not-a-uuid", fd)).rejects.toThrow();
    expect(uploadImageFromFormData).not.toHaveBeenCalled();
  });

  it("does not upload or write when the admin gate rejects", async () => {
    assertAdmin.mockRejectedValueOnce(new Error("Non autorisé"));
    const { uploadAvatar } = await import("./avatars");
    const fd = new FormData();
    fd.set("file", makeFile("image/png", 1000));
    await expect(uploadAvatar(UUID, fd)).rejects.toThrow(/autoris/i);
    expect(uploadImageFromFormData).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it("does not write avatar_url when the upload fails", async () => {
    uploadImageFromFormData.mockRejectedValueOnce(new Error("boom"));
    const { uploadAvatar } = await import("./avatars");
    const fd = new FormData();
    fd.set("file", makeFile("image/png", 1000));
    await expect(uploadAvatar(UUID, fd)).rejects.toThrow(/boom/);
    expect(update).not.toHaveBeenCalled();
  });
});
