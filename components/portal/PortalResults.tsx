"use client";

import { Download } from "lucide-react";
import toast from "react-hot-toast";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { downloadFile } from "@/lib/download";
import { getApiErrorMessage } from "@/lib/errors";
import { useT } from "@/lib/i18n/useT";
import { useGetMyResultsQuery } from "@/redux/api/portalApi";

export function PortalResults() {
  const { t } = useT();
  const { data, isLoading, error, refetch } = useGetMyResultsQuery();

  if (isLoading) return <Skeleton className="h-64 w-full max-w-2xl" />;
  if (error || !data) return <ErrorState error={error} onRetry={refetch} />;

  const download = async (r: NonNullable<typeof data>[number]) => {
    if (!r.studentId) return;
    try {
      await downloadFile(`/me/results/${r.examId}/${r.studentId}/marksheet.pdf`, `marksheet-${r.examName}.pdf`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, t));
    }
  };

  return (
    <>
      <PageHeader title={t("pt.results.title")} />
      {data.length === 0 ? (
        <EmptyState title={t("exam.results.empty")} />
      ) : (
        <div className="max-w-2xl space-y-3">
          {data.map((r) => (
            <Card key={r._id}>
              <CardContent className="flex items-center justify-between gap-3 pt-5">
                <span>
                  <span className="block font-semibold text-navy">{r.examName}</span>
                  <span className="block text-sm text-muted-foreground">
                    {r.totalMarks}/{r.fullMarks} {r.gpa ? `· GPA ${r.gpa}` : ""} {r.letter ? `· ${r.letter}` : ""} · {r.passed ? t("exam.results.passed") : t("exam.results.failed")}
                  </span>
                </span>
                <Button variant="outline" onClick={() => download(r)}>
                  <Download aria-hidden="true" />
                  {t("exam.sheet.pdf")}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
