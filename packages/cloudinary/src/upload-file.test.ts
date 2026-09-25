// @vitest-environment node
// jsdom's Blob/File don't implement arrayBuffer() (only slice/size/type),
// so this test runs in the Node environment instead.
import { beforeEach, describe, expect, it, vi } from "vitest";

const uploadImage = vi.fn();

vi.mock("./client", () => ({
  uploadImage: (...a: unknown[]) => uploadImage(...a),
}));

function makeFile(type: string, size: number): File {
  const blob = new Blob([new Uint8Array(size)], { type });
  return new File([blob], "image.png", { type });
}

describe("uploadImageFile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    uploadImage.mockResolvedValue({
      secureUrl: "https://res.cloudinary.com/demo/image/upload/z.png",
    });
  });

  it("uploads a valid file as a Buffer and forwards the upload options", async () => {
    const { uploadImageFile } = await import("./upload-file");

    const result = await uploadImageFile(makeFile("image/png", 1000), {
      folder: "bomo_logos",
      publicId: "doc-1",
      overwrite: true,
    });

    expect(uploadImage).toHaveBeenCalledWith(expect.any(Buffer), {
      folder: "bomo_logos",
      publicId: "doc-1",
      overwrite: true,
    });
    expect(result.secureUrl).toContain("res.cloudinary.com");
  });

  it("does not leak the validation options into the Cloudinary call", async () => {
    const { uploadImageFile } = await import("./upload-file");

    await uploadImageFile(makeFile("image/png", 1000), {
      folder: "bomo_logos",
      acceptedTypes: ["image/png"],
      maxBytes: 2000,
    });

    expect(uploadImage).toHaveBeenCalledWith(expect.any(Buffer), {
      folder: "bomo_logos",
    });
  });

  it("rejects a missing file", async () => {
    const { uploadImageFile, ImageValidationError } = await import(
      "./upload-file"
    );
    await expect(
      uploadImageFile(null, { folder: "bomo_logos" }),
    ).rejects.toBeInstanceOf(ImageValidationError);
    expect(uploadImage).not.toHaveBeenCalled();
  });

  it("rejects an unsupported mime type and lists the accepted ones", async () => {
    const { uploadImageFile } = await import("./upload-file");
    await expect(
      uploadImageFile(makeFile("image/gif", 1000), { folder: "bomo_logos" }),
    ).rejects.toThrow(/JPEG, PNG, WEBP/);
    expect(uploadImage).not.toHaveBeenCalled();
  });

  it("honours a narrowed acceptedTypes list", async () => {
    const { uploadImageFile } = await import("./upload-file");
    await expect(
      uploadImageFile(makeFile("image/webp", 1000), {
        folder: "bomo_logos",
        acceptedTypes: ["image/png", "image/jpeg"],
      }),
    ).rejects.toThrow(/PNG, JPEG/);
    expect(uploadImage).not.toHaveBeenCalled();
  });

  it("rejects a file over the size ceiling", async () => {
    const { uploadImageFile } = await import("./upload-file");
    await expect(
      uploadImageFile(makeFile("image/png", 5 * 1024 * 1024 + 1), {
        folder: "bomo_logos",
      }),
    ).rejects.toThrow(/5 Mo maximum/);
    expect(uploadImage).not.toHaveBeenCalled();
  });
});

describe("uploadImageFromFormData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    uploadImage.mockResolvedValue({
      secureUrl: "https://res.cloudinary.com/demo/image/upload/z.png",
    });
  });

  it("reads the `file` field by default", async () => {
    const { uploadImageFromFormData } = await import("./upload-file");
    const formData = new FormData();
    formData.set("file", makeFile("image/png", 1000));

    await uploadImageFromFormData(formData, { folder: "bomo_logos" });

    expect(uploadImage).toHaveBeenCalledWith(expect.any(Buffer), {
      folder: "bomo_logos",
    });
  });

  it("reads a custom field name", async () => {
    const { uploadImageFromFormData } = await import("./upload-file");
    const formData = new FormData();
    formData.set("logo", makeFile("image/png", 1000));

    await uploadImageFromFormData(formData, {
      folder: "bomo_logos",
      fieldName: "logo",
    });

    expect(uploadImage).toHaveBeenCalled();
  });

  it("rejects when the field is absent", async () => {
    const { uploadImageFromFormData, ImageValidationError } = await import(
      "./upload-file"
    );
    await expect(
      uploadImageFromFormData(new FormData(), { folder: "bomo_logos" }),
    ).rejects.toBeInstanceOf(ImageValidationError);
  });
});
