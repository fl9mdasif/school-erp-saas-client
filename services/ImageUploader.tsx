"use client";

import { useState } from "react";
import Image from "next/image";
import { CheckCircle2, Loader2, UploadCloud, X } from "lucide-react";
import toast from "react-hot-toast";
import { useT } from "@/lib/i18n/useT";
import { useSignUploadMutation, type TUploadFolder } from "@/redux/api/uploadApi";
import { compressImage, UploadError, uploadToCloudinary } from "./cloudinaryUpload";

interface ImageUploaderProps {
  onUploadSuccess: (url: string) => void;
  initialImageUrl?: string;
  /** Cloudinary folder under the school's own folder. Teachers may only use "notices". */
  folder?: TUploadFolder;
  className?: string;
  /** "square" is a small fixed thumbnail for logos and portraits; "wide" is a capped banner preview. */
  shape?: "wide" | "square";
}

const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // same limit the server enforces on signed uploads

export const ImageUploader = ({
  onUploadSuccess,
  initialImageUrl,
  folder = "photos",
  className = "",
  shape = "wide",
}: ImageUploaderProps) => {
  const { t } = useT();
  const [signUpload] = useSignUploadMutation();
  const [stage, setStage] = useState<"idle" | "compressing" | "uploading">("idle");
  const [percent, setPercent] = useState(0);
  const [preview, setPreview] = useState(initialImageUrl || "");
  const [uploadedKb, setUploadedKb] = useState<number | null>(null);

  const busy = stage !== "idle";
  const box = shape === "square" ? "size-36" : "h-44 w-full max-w-md";
  const fit = shape === "square" ? "object-contain p-1" : "object-cover";

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow choosing the same file again after a failure
    if (!file) return;
    try {
      setStage("compressing");
      const blob = await compressImage(file, MAX_IMAGE_BYTES);

      setStage("uploading");
      setPercent(0);
      const signed = await signUpload({ kind: "image", folder }).unwrap();
      const url = await uploadToCloudinary(blob, signed, setPercent);

      setPreview(url);
      setUploadedKb(Math.round(blob.size / 1024));
      onUploadSuccess(url);
      toast.success(t("upload.done"));
    } catch (err) {
      const code = err instanceof UploadError ? err.code : "FAILED";
      toast.error(t(`upload.err.${code}` as const));
    } finally {
      setStage("idle");
    }
  };

  const removeImage = () => {
    setPreview("");
    setUploadedKb(null);
    onUploadSuccess("");
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {preview ? (
        <div className={`group relative ${box} overflow-hidden rounded-xl border border-border bg-muted`}>
          <Image src={preview} alt="" fill sizes="(max-width: 768px) 100vw, 400px" className={fit} />
          {uploadedKb !== null ? (
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-md bg-navy/80 px-2 py-1 text-xs text-white">
              <CheckCircle2 size={12} aria-hidden="true" />
              {uploadedKb} KB
            </div>
          ) : null}
          <button
            type="button"
            onClick={removeImage}
            aria-label={t("upload.remove")}
            className="absolute right-2 top-2 grid size-11 place-items-center rounded-lg bg-navy/80 text-white transition-colors hover:bg-destructive"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      ) : (
        <label
          className={`flex ${box} flex-col items-center justify-center rounded-xl border-2 border-dashed border-input bg-card transition-colors duration-200 hover:border-primary hover:bg-primary-tint/40 ${
            busy ? "cursor-wait" : "cursor-pointer"
          }`}
        >
          {busy ? (
            <div className="flex flex-col items-center gap-2" role="status">
              <Loader2 className="size-7 animate-spin text-primary" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">
                {stage === "compressing" ? t("upload.compressing") : t("upload.uploading", { percent })}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 px-4 text-center">
              <span className="grid size-12 place-items-center rounded-xl bg-primary-tint text-primary-deep">
                <UploadCloud className="size-6" aria-hidden="true" />
              </span>
              <p className="text-sm font-medium text-foreground">{t("upload.image.cta")}</p>
              <p className="text-xs text-muted-foreground">{t("upload.image.hint")}</p>
            </div>
          )}
          <input
            type="file"
            className="sr-only"
            onChange={handleFileChange}
            disabled={busy}
            accept="image/jpeg,image/png,image/webp"
          />
        </label>
      )}
    </div>
  );
};
