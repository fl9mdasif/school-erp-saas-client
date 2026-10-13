"use client";

import { ArrowLeft, Pencil } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ErrorState } from "@/components/common/ErrorState";
import { PageHeader } from "@/components/common/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useT } from "@/lib/i18n/useT";
import { useGetStudentQuery } from "@/redux/api/studentApi";
import { ProfileTab } from "./ProfileTab";
import { EnrolmentsTab } from "./EnrolmentsTab";
import { StudentStatusChip } from "./StudentStatusChip";

export function StudentDetail({ id }: { id: string }) {
  const { t, term, lang } = useT();
  const { data: s, isLoading, error, refetch } = useGetStudentQuery(id);

  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (isLoading || !s) {
    return (
      <div className="space-y-4" role="status" aria-label={t("common.loading")}>
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <>
      <Link href="/dashboard/students" className="mb-3 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary hover:underline">
        <ArrowLeft className="size-4" aria-hidden="true" />
        {t("stu.form.back", { student: term("student") })}
      </Link>

      <PageHeader
        title={lang === "bn" && s.nameBn ? s.nameBn : s.name}
        description={`${t("stu.detail.id")}: ${s.studentId}`}
        action={
          <Button variant="outline" asChild>
            <Link href={`/dashboard/students/${s._id}/edit`}>
              <Pencil aria-hidden="true" />
              {t("common.edit")}
            </Link>
          </Button>
        }
      />

      <div className="mb-4 flex items-center gap-3">
        {s.photoUrl ? <Image src={s.photoUrl} alt="" width={56} height={56} className="size-14 rounded-full object-cover" /> : null}
        <StudentStatusChip status={s.status} />
      </div>

      <Tabs defaultValue="profile">
        <TabsList aria-label={t("stu.detail.tabs")}>
          <TabsTrigger value="profile">{t("stu.tab.profile")}</TabsTrigger>
          <TabsTrigger value="enrolments">{t("stu.tab.enrolments")}</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <ProfileTab student={s} />
        </TabsContent>
        <TabsContent value="enrolments">
          <EnrolmentsTab student={s} />
        </TabsContent>
      </Tabs>
    </>
  );
}
