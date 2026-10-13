"use client";

import { StatusChip, type TTone } from "@/components/common/StatusChip";
import { useT } from "@/lib/i18n/useT";
import type { TTenantStatus } from "@/types";

const TONE: Record<TTenantStatus, TTone> = {
  trial: "info",
  active: "success",
  suspended: "warning",
  cancelled: "destructive",
};

/** Status is a word plus an icon, never colour alone. */
export function TenantStatusChip({ status }: { status: TTenantStatus }) {
  const { t } = useT();
  return <StatusChip tone={TONE[status]}>{t(`pf.status.${status}`)}</StatusChip>;
}
