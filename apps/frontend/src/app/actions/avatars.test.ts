// @vitest-environment node
// jsdom's Blob/File don't implement arrayBuffer() (only slice/size/type),
// so this server-action test runs in the Node environment instead.
import { beforeEach, describe, expect, it, vi } from "vitest";

const uploadImage = vi.fn();
const assertAdmin = vi.fn();
const update = vi.fn();
const eq = vi.fn();
const from = vi.fn();
const revalidatePath = vi.fn();

vi.mock("@playground/cloudinary", () => ({
  uploadImage: (...a: unknown[]) => uploadImage(...a),
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

describe("uploadAvatar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    from.mockReturnValue({ update });
    update.mockReturnValue({ eq });
    eq.mockResolvedValue({ error: null });
    uploadImage.mockResolvedValue({
      secureUrl:
        "https://res.cloudinary.com/demo/image/upload/bomo_avatars/z.webp",
    });
  });

  it("uploads, writes avatar_url, revalidates, and returns the url", async () => {
    const { uploadAvatar } = await import("./avatars");
    const fd = new FormData();
    fd.set("file", makeFile("image/png", 1000));

    const result = await uploadAvatar(UUID, fd);

    expect(assertAdmin).toHaveBeenCalled();
    expect(uploadImage).toHaveBeenCalledWith(
      expect.any(Buffer),
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
    expect(update).toHaveBeenCalledWith({
      avatar_url:
        "https://res.cloudinary.com/demo/image/upload/bomo_avatars/z.webp",
    });
    expect(eq).toHaveBeenCalledWith("id", UUID);
    expect(revalidatePath).toHaveBeenCalledWith("/users");
    expect(result.secureUrl).toContain("res.cloudinary.com");
  });

  it("rejects an unsupported mime type", async () => {
    const { uploadAvatar } = await import("./avatars");
    const fd = new FormData();
    fd.set("file", makeFile("image/gif", 1000));
    await expect(uploadAvatar(UUID, fd)).rejects.toThrow(/format/i);
    expect(uploadImage).not.toHaveBeenCalled();
  });

  it("rejects a file larger than 5 MB", async () => {
    const { uploadAvatar } = await import("./avatars");
    const fd = new FormData();
    fd.set("file", makeFile("image/png", 5 * 1024 * 1024 + 1));
    await expect(uploadAvatar(UUID, fd)).rejects.toThrow(/5\s*Mo|lourde/i);
    expect(uploadImage).not.toHaveBeenCalled();
  });

  it("rejects a non-uuid userId", async () => {
    const { uploadAvatar } = await import("./avatars");
    const fd = new FormData();
    fd.set("file", makeFile("image/png", 1000));
    await expect(uploadAvatar("not-a-uuid", fd)).rejects.toThrow();
    expect(uploadImage).not.toHaveBeenCalled();
  });

  it("does not upload or write when the admin gate rejects", async () => {
    assertAdmin.mockRejectedValueOnce(new Error("Non autorisé"));
    const { uploadAvatar } = await import("./avatars");
    const fd = new FormData();
    fd.set("file", makeFile("image/png", 1000));
    await expect(uploadAvatar(UUID, fd)).rejects.toThrow(/autoris/i);
    expect(uploadImage).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });
});
