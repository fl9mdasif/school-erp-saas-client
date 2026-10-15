"use client";

import { ArrowDown, ArrowUp, Loader2, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import toast from "react-hot-toast";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/lib/errors";
import { useT } from "@/lib/i18n/useT";
import { useGetSiteQuery, useUpdateSiteMutation } from "@/redux/api/websiteApi";
import { ImageUploader } from "@/services/ImageUploader";
import type { TGalleryImage } from "@/types";

export function WebsiteGallery() {
  const { t } = useT();
  const { data: site, isLoading, error, refetch } = useGetSiteQuery();
  const [update, updating] = useUpdateSiteMutation();
  const [adding, setAdding] = useState(false);

  if (isLoading) return <Skeleton className="h-64 w-full max-w-3xl" />;
  if (error || !site) return <ErrorState error={error} onRetry={refetch} />;

  const save = async (gallery: TGalleryImage[]) => {
    try {
      await update({ gallery }).unwrap();
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
  };

  const move = (i: number, dir: -1 | 1) => {
    const next = [...site.gallery];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    save(next);
  };

  const remove = (i: number) => save(site.gallery.filter((_, idx) => idx !== i));
  const setCaption = (i: number, caption: string) => save(site.gallery.map((g, idx) => (idx === i ? { ...g, caption } : g)));

  return (
    <>
      <PageHeader
        title={t("web.gallery.title")}
        description={t("web.gallery.desc")}
        action={
          <Button onClick={() => setAdding(true)}>
            <Plus aria-hidden="true" />
            {t("web.gallery.add")}
          </Button>
        }
      />
      {adding ? (
        <div className="mb-4 max-w-sm">
          <ImageUploader
            folder="gallery"
            onUploadSuccess={(url) => {
              save([...site.gallery, { url }]);
              setAdding(false);
            }}
          />
        </div>
      ) : null}
      {site.gallery.length === 0 ? (
        <EmptyState title={t("web.gallery.empty")} />
      ) : (
        <div className="grid max-w-4xl gap-4 sm:grid-cols-2 md:grid-cols-3">
          {site.gallery.map((g, i) => (
            <div key={g.url + i} className="space-y-2 rounded-lg border border-border p-2">
              <div className="relative aspect-video overflow-hidden rounded-md bg-muted">
                <Image src={g.url} alt={g.caption ?? ""} fill className="object-cover" />
              </div>
              <Input defaultValue={g.caption ?? ""} placeholder={t("web.gallery.caption")} onBlur={(e) => setCaption(i, e.target.value)} />
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => move(i, -1)} disabled={i === 0} aria-label={t("web.gallery.moveUp")}>
                    <ArrowUp aria-hidden="true" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => move(i, 1)} disabled={i === site.gallery.length - 1} aria-label={t("web.gallery.moveDown")}>
                    <ArrowDown aria-hidden="true" />
                  </Button>
                </div>
                <Button variant="ghost" size="icon" onClick={() => remove(i)} aria-label={t("common.delete")}>
                  {updating.isLoading ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Trash2 aria-hidden="true" />}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
