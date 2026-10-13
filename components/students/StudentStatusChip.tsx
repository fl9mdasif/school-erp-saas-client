import { StatusChip, type TTone } from "@/components/common/StatusChip";
import { useT } from "@/lib/i18n/useT";
import type { TStudentStatus } from "@/types";

const TONE: Record<TStudentStatus, TTone> = {
  active: "success",
  transferred: "info",
  passed_out: "default",
  dropped: "warning",
  inactive: "muted",
};

export function StudentStatusChip({ status }: { status: TStudentStatus }) {
  const { t } = useT();
  return <StatusChip tone={TONE[status]}>{t(`stu.status.${status}`)}</StatusChip>;
}
