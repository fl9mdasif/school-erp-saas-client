"use client";

import { FileText, Loader2, UploadCloud, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useT } from "@/lib/i18n/useT";
import { useSignUploadMutation } from "@/redux/api/uploadApi";
import { UploadError, uploadToCloudinary } from "@/services/cloudinaryUpload";

type Props = {
  onUploaded: (file: { url: string; name: string }) => void;
  onRemove?: () => void;
  current?: { url: string; name: string } | null;
};

/** PDF attachments for notices. Same signed, direct-to-Cloudinary flow as images. */
export function FileUpload({ onUploaded, onRemove, current }: Props) {
  const { t } = useT();
  const [signUpload] = useSignUploadMutation();
  const [percent, setPercent] = useState<number | null>(null);

  const pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      if (file.type !== "application/pdf") throw new UploadError("BAD_TYPE");
      setPercent(0);
      const signed = await signUpload({ kind: "pdf", folder: "notices" }).unwrap();
      const url = await uploadToCloudinary(file, signed, setPercent);
      onUploaded({ url, name: file.name });
      toast.success(t("upload.done"));
    } catch (err) {
      const code = err instanceof UploadError ? err.code : "FAILED";
      toast.error(t(`upload.err.${code}` as const));
    } finally {
      setPercent(null);
    }
  };

  if (current) {
    return (
      <div className="flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2">
        <FileText className="size-5 text-primary" aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate text-sm">{current.name}</span>
        {onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            aria-label={t("upload.remove")}
            className="grid size-11 place-items-center rounded-md text-muted-foreground hover:bg-accent"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-md border-2 border-dashed border-input bg-card px-4 py-3 transition-colors hover:border-primary hover:bg-primary-tint/40">
      {percent !== null ? (
        <Loader2 className="size-5 animate-spin text-primary" aria-hidden="true" />
      ) : (
        <UploadCloud className="size-5 text-primary" aria-hidden="true" />
      )}
      <span className="text-sm">
        <span className="font-medium">
          {percent !== null ? t("upload.uploading", { percent }) : t("upload.pdf.cta")}
        </span>
        <span className="block text-xs text-muted-foreground">{t("upload.pdf.hint")}</span>
      </span>
      <input type="file" accept="application/pdf" className="sr-only" onChange={pick} disabled={percent !== null} />
    </label>
  );
}
