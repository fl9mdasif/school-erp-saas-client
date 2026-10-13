import axios from "axios";
import type { TSignedUpload } from "@/redux/api/uploadApi";

export class UploadError extends Error {
  constructor(public code: "TOO_LARGE" | "BAD_TYPE" | "NOT_CONFIGURED" | "FAILED") {
    super(code);
  }
}

const MAX_DIMENSION = 1600; // long edge in pixels, plenty for a phone screen and a printed card

/**
 * Shrinks a photo in the browser before upload: long edge about 1600 px, JPEG, quality lowered until it
 * fits under maxBytes. Saves the parent's mobile data and keeps us under the server's 2 MB image limit.
 */
export async function compressImage(file: File, maxBytes: number): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new window.Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new UploadError("BAD_TYPE"));
      el.src = url;
    });
    let { width, height } = img;
    const ratio = Math.min(1, MAX_DIMENSION / Math.max(width, height));
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new UploadError("FAILED");
    ctx.drawImage(img, 0, 0, width, height);

    for (let quality = 0.85; quality >= 0.4; quality -= 0.1) {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
      if (blob && blob.size <= maxBytes) return blob;
    }
    throw new UploadError("TOO_LARGE");
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Sends the file straight to Cloudinary with the signed fields the API gave us.
 * A plain axios call on purpose: our own instance would attach the user's Bearer token,
 * and that token must never be sent to a third party.
 */
export async function uploadToCloudinary(
  file: Blob,
  signed: TSignedUpload,
  onProgress?: (percent: number) => void
): Promise<string> {
  if (signed.provider !== "cloudinary") throw new UploadError("NOT_CONFIGURED");
  if (file.size > signed.maxBytes) throw new UploadError("TOO_LARGE");

  const form = new FormData();
  // Cloudinary ignores field order, but the file goes last by convention
  for (const [key, value] of Object.entries(signed.fields)) form.append(key, value);
  form.append("file", file);

  try {
    const res = await axios.post(signed.uploadUrl, form, {
      withCredentials: false,
      onUploadProgress: (e) => {
        if (e.total && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
      },
    });
    const url: string | undefined = res.data?.secure_url;
    if (!url) throw new UploadError("FAILED");
    return url;
  } catch (err) {
    if (err instanceof UploadError) throw err;
    throw new UploadError("FAILED");
  }
}
