"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { USER_ROLE, type TRole } from "@/contains/role";
import { Skeleton } from "@/components/ui/skeleton";
import { roleHome } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/useT";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setAuthStatus } from "@/redux/slices/authSlice";

type Props = {
  /** Roles allowed on this route group. */
  allow: TRole[];
  children: React.ReactNode;
};

/**
 * Client side gate for the dashboard and the platform console. It waits for the silent refresh,
 * sends signed-out visitors to the login page, and sends a role to its own home with a toast
 * when the route is not for it. This only decides what to show; the API is the real gate.
 */
export function AuthGuard({ allow, children }: Props) {
  const { t } = useT();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { status, user } = useAppSelector((s) => s.auth);

  const forbidden = status === "authenticated" && !!user && !allow.includes(user.role);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(pathname.startsWith("/platform") ? "/platform/login" : "/login");
    } else if (forbidden && user) {
      toast.error("You do not have access to that page.", { id: "forbidden-route" });
      router.replace(roleHome(user.role));
    } else if (
      status === "authenticated" &&
      user?.mustChangePassword &&
      user.role !== USER_ROLE.SUPER_ADMIN &&
      pathname !== "/change-password"
    ) {
      router.replace("/change-password");
    }
  }, [status, user, forbidden, pathname, router]);

  if (status === "offline") {
    return (
      <div role="alert" className="mx-auto mt-24 max-w-md space-y-3 rounded-xl border border-border bg-card p-6 text-center">
        <h1 className="text-lg font-semibold text-navy">{t("auth.offline.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("auth.offline.body")}</p>
        <Button onClick={() => dispatch(setAuthStatus("idle"))}>{t("auth.offline.retry")}</Button>
      </div>
    );
  }

  if (status !== "authenticated" || forbidden) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 p-6" role="status" aria-label="Loading">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  return <>{children}</>;
}
