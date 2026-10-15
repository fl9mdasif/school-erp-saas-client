"use client";

import { ChildPicker } from "./ChildPicker";
import { NoticesFeed } from "./NoticesFeed";
import { PageHeader } from "@/components/common/PageHeader";
import { useT } from "@/lib/i18n/useT";

export function PortalHome() {
  const { t, term } = useT();

  return (
    <>
      <PageHeader title={t("pt.home.title")} description={t("pt.home.desc", { student: term("student") })} />
      <ChildPicker>{() => null}</ChildPicker>
      <NoticesFeed />
    </>
  );
}
