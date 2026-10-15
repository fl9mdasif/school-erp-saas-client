"use client";

import { PageHeader } from "@/components/common/PageHeader";
import { useT } from "@/lib/i18n/useT";
import { NoticesFeed } from "./NoticesFeed";

export function PortalNotices() {
  const { t } = useT();
  return (
    <>
      <PageHeader title={t("pt.notices.title")} />
      <NoticesFeed limit={50} />
    </>
  );
}
