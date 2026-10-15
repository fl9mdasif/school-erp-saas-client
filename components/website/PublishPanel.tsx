"use client";

import { Check, ExternalLink, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { StatusChip } from "@/components/common/StatusChip";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getApiErrorMessage } from "@/lib/errors";
import { useT } from "@/lib/i18n/useT";
import { usePublishSiteMutation, useUnpublishSiteMutation } from "@/redux/api/websiteApi";
import { useAppSelector } from "@/redux/hooks";
import type { TSite } from "@/types";

export function PublishPanel({ site }: { site: TSite }) {
  const { t } = useT();
  const slug = useAppSelector((s) => s.auth.tenant?.slug);
  const [publish, publishing] = usePublishSiteMutation();
  const [unpublish, unpublishing] = useUnpublishSiteMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const checklist = [
    { key: "hero", ok: !!site.hero?.title },
    { key: "about", ok: !!site.about },
    { key: "contact", ok: !!site.contact?.phone || !!site.contact?.email },
  ];
  const ready = checklist.every((c) => c.ok);

  const confirmPublish = async () => {
    try {
      await publish().unwrap();
      toast.success(t("web.published"));
      setConfirmOpen(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
  };

  const doUnpublish = async () => {
    try {
      await unpublish().unwrap();
      toast.success(t("web.unpublished"));
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
  };

  return (
    <Card className="mb-4 max-w-3xl">
      <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-5">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <StatusChip tone={site.isPublished ? "success" : "muted"}>{site.isPublished ? t("web.status.published") : t("web.status.draft")}</StatusChip>
            {slug ? (
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/schools/${slug}`} target="_blank">
                  <ExternalLink aria-hidden="true" />
                  {t("web.preview")}
                </Link>
              </Button>
            ) : null}
          </div>
          <ul className="space-y-1 text-sm">
            {checklist.map((c) => (
              <li key={c.key} className="flex items-center gap-2">
                {c.ok ? <Check className="size-4 text-success" aria-hidden="true" /> : <X className="size-4 text-destructive" aria-hidden="true" />}
                {t(`web.checklist.${c.key}`)}
              </li>
            ))}
          </ul>
        </div>
        {site.isPublished ? (
          <Button variant="outline" onClick={doUnpublish} disabled={unpublishing.isLoading}>
            {t("web.unpublish")}
          </Button>
        ) : (
          <Button disabled={!ready || publishing.isLoading} onClick={() => setConfirmOpen(true)}>
            {t("web.publish")}
          </Button>
        )}
      </CardContent>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t("web.publishTitle")}
        description={t("web.publishDesc")}
        confirmLabel={t("web.publish")}
        onConfirm={confirmPublish}
        loading={publishing.isLoading}
      />
    </Card>
  );
}
