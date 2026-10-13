"use client";

import { useState } from "react";
import axios from "axios";
import { UploadCloud, X, Loader2, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";

interface ImageUploaderProps {
  onUploadSuccess: (url: string) => void;
  initialImageUrl?: string;
}

const MAX_SIZE_BYTES = 100 * 1024; // 100 KB

/**
 * Compress an image file using a canvas until it is under maxBytes.
 * Returns a Blob ready for upload.
 */
async function compressImage(file: File, maxBytes: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const canvas = document.createElement("canvas");
      // Start at original dimensions, scale down if needed
      let { width, height } = img;

      // Scale down large images proportionally to help compression
      const MAX_DIM = 1200;
      if (width > MAX_DIM || height > MAX_DIM) {
        const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);

      // Iteratively reduce quality until under maxBytes
      let quality = 0.9;
      const tryCompress = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Canvas toBlob failed"));
              return;
            }
            if (blob.size <= maxBytes || quality <= 0.1) {
              resolve(blob);
            } else {
              quality = Math.max(0.1, quality - 0.1);
              tryCompress();
            }
          },
          "image/jpeg",
          quality,
        );
      };

      tryCompress();
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image"));
    };

    img.src = objectUrl;
  });
}

export const ImageUploader = ({
  onUploadSuccess,
  initialImageUrl,
}: ImageUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(initialImageUrl || "");
  const [compressedKb, setCompressedKb] = useState<number | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setCompressedKb(null);

      // --- Compress ---
      const compressed = await compressImage(file, MAX_SIZE_BYTES);
      const finalKb = Math.round(compressed.size / 1024);
      setCompressedKb(finalKb);

      // --- Build FormData ---
      const formData = new FormData();
      // Convert blob back to a named File so imgBB gets a proper filename
      const compressedFile = new File(
        [compressed],
        `portfolio-${Date.now()}.jpg`,
        { type: "image/jpeg" },
      );
      formData.append("image", compressedFile);
      formData.append("name", compressedFile.name);

      // --- Upload to imgBB ---
      const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
      const response = await axios.post(
        `https://api.imgbb.com/1/upload?key=${apiKey}`,
        formData,
      );

      if (response.data.success) {
        const imageUrl = response.data.data.display_url;
        setPreview(imageUrl);
        onUploadSuccess(imageUrl);
        toast.success(`Uploaded · ${finalKb} KB`);
      } else {
        throw new Error("Upload failed");
      }
    } catch (error: unknown) {
      console.error("Upload error:", error);
      toast.error(
        "Failed to upload image.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    setPreview("");
    setCompressedKb(null);
    onUploadSuccess("");
  };

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="relative w-full h-44 rounded-xl overflow-hidden border border-white/[0.08] group bg-[#161b27]">
          <Image
            src={preview}
            alt="Preview"
            fill
            className="object-cover"
          />
          {/* Size badge */}
          {compressedKb !== null && (
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm text-xs text-emerald-400">
              <CheckCircle2 size={11} />
              {compressedKb} KB
            </div>
          )}
          {/* Remove button */}
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-sm rounded-lg text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-200"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-44 rounded-xl border-2 border-dashed border-white/[0.08] bg-[#161b27] hover:border-teal-500/30 hover:bg-teal-500/[0.03] cursor-pointer transition-all duration-200 group">
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-7 h-7 animate-spin text-teal-400" />
              <p className="text-sm text-slate-400">Compressing &amp; uploading…</p>
              <p className="text-xs text-slate-600">Target: &lt;100 KB</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] group-hover:border-teal-500/20 transition-colors">
                <UploadCloud className="w-6 h-6 text-slate-500 group-hover:text-teal-400 transition-colors" />
              </div>
              <p className="text-sm font-medium text-slate-400 group-hover:text-slate-200 transition-colors">
                Click to upload image
              </p>
              <p className="text-xs text-slate-600">
                Auto-compressed to &lt;100 KB · JPG, PNG, WebP
              </p>
            </div>
          )}
          <input
            type="file"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
            accept="image/*"
          />
        </label>
      )}
    </div>
  );
};
