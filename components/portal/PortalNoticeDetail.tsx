"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ErrorState } from "@/components/common/ErrorState";
import { RichText } from "@/components/common/RichText";
import { PageHeader } from "@/components/common/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { formatLocalDate, isoToLocalDate } from "@/lib/format";
import { useT } from "@/lib/i18n/useT";
import { useGetNoticeQuery } from "@/redux/api/communicationApi";
import { useAppSelector } from "@/redux/hooks";

export function PortalNoticeDetail({ id }: { id: string }) {
  const { t, lang } = useT();
  const banglaDigits = useAppSelector((s) => s.ui.banglaDigits);
  const fmt = { lang, banglaDigits } as const;
  const { data: notice, isLoading, error, refetch } = useGetNoticeQuery(id);

  if (isLoading) return <Skeleton className="h-64 w-full max-w-2xl" />;
  if (error || !notice) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <>
      <Link href="/dashboard/portal/notices" className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
        <ArrowLeft className="size-4" aria-hidden="true" />
        {t("pt.notices.title")}
      </Link>
      <PageHeader title={notice.title} description={formatLocalDate(isoToLocalDate(notice.publishAt), fmt)} />
      <RichText html={notice.body} className="prose max-w-2xl" />
      {notice.attachments.length > 0 ? (
        <div className="mt-6 max-w-2xl space-y-2">
          {notice.attachments.map((a, i) => (
            <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" className="block text-sm text-primary hover:underline">
              {a.name ?? `Attachment ${i + 1}`}
            </a>
          ))}
        </div>
      ) : null}
    </>
  );
}
