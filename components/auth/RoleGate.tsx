"use client";

import { can, type TPermission } from "@/lib/permissions";
import { useAppSelector } from "@/redux/hooks";

type Props = {
  permission: TPermission;
  /** Rendered instead when the role lacks the permission (default: nothing). */
  fallback?: React.ReactNode;
  children: React.ReactNode;
};

/** Hides UI the signed-in role cannot use. A convenience only: the server still enforces it. */
export function RoleGate({ permission, fallback = null, children }: Props) {
  const role = useAppSelector((s) => s.auth.user?.role);
  return can(role, permission) ? <>{children}</> : <>{fallback}</>;
}

export const useCan = (permission: TPermission): boolean => {
  const role = useAppSelector((s) => s.auth.user?.role);
  return can(role, permission);
};
