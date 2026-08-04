import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const uploadStream = vi.fn();
const config = vi.fn();

vi.mock("cloudinary", () => ({
  v2: {
    config: (...args: unknown[]) => config(...args),
    uploader: {
      upload_stream: (
        opts: unknown,
        cb: (err: unknown, res: unknown) => void,
      ) => uploadStream(opts, cb),
    },
  },
}));

describe("uploadImage", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME", "demo");
    vi.stubEnv("CLOUDINARY_API_KEY", "key");
    vi.stubEnv("CLOUDINARY_API_SECRET", "secret");
    config.mockReset();
    uploadStream.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("uploads a buffer with mapped options and returns a normalized result", async () => {
    uploadStream.mockImplementation((_opts, cb) => {
      const stream = {
        end: () =>
          cb(null, {
            secure_url: "https://res.cloudinary.com/demo/image/upload/z.webp",
            public_id: "bomo_avatars/user-1",
            width: 400,
            height: 400,
            format: "webp",
            bytes: 1234,
          }),
      };
      return stream;
    });

    const { uploadImage } = await import("./client");
    const result = await uploadImage(Buffer.from("img"), {
      folder: "bomo_avatars",
      publicId: "user-1",
      overwrite: true,
      format: "webp",
      transformation: { width: 400, height: 400, crop: "fill" },
    });

    expect(uploadStream).toHaveBeenCalledWith(
      expect.objectContaining({
        folder: "bomo_avatars",
        public_id: "user-1",
        overwrite: true,
        format: "webp",
        resource_type: "image",
        transformation: { width: 400, height: 400, crop: "fill" },
      }),
      expect.any(Function),
    );
    expect(result).toEqual({
      secureUrl: "https://res.cloudinary.com/demo/image/upload/z.webp",
      publicId: "bomo_avatars/user-1",
      width: 400,
      height: 400,
      format: "webp",
      bytes: 1234,
    });
  });

  it("throws CloudinaryConfigError when env vars are missing", async () => {
    vi.unstubAllEnvs();
    vi.resetModules();
    const { uploadImage, CloudinaryConfigError } = await import("./client");
    await expect(
      uploadImage(Buffer.from("x"), { folder: "bomo_avatars" }),
    ).rejects.toBeInstanceOf(CloudinaryConfigError);
  });

  it("wraps SDK failures in CloudinaryUploadError", async () => {
    uploadStream.mockImplementation((_opts, cb) => ({
      end: () => cb(new Error("boom"), null),
    }));
    const { uploadImage, CloudinaryUploadError } = await import("./client");
    await expect(
      uploadImage(Buffer.from("x"), { folder: "bomo_avatars" }),
    ).rejects.toBeInstanceOf(CloudinaryUploadError);
  });
});
