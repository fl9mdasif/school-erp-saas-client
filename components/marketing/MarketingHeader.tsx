"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Brand } from "@/components/layout/Brand";
import { Button } from "@/components/ui/button";
import { roleHome } from "@/lib/permissions";
import { useT } from "@/lib/i18n/useT";
import { useSignOut } from "@/lib/useSignOut";
import { useAppSelector } from "@/redux/hooks";

/** Public site header. Signed out: log in and sign up. Signed in: which school, a way back to the dashboard, and sign out. */
export function MarketingHeader() {
  const { t } = useT();
  const user = useAppSelector((s) => s.auth.user);
  const tenant = useAppSelector((s) => s.auth.tenant);
  const status = useAppSelector((s) => s.auth.status);
  const signOut = useSignOut();
  const signedIn = status === "authenticated" && !!user;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <Link href="/" aria-label="Home" className="mr-auto rounded-md">
          <Brand onLight /> 
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          <Button asChild variant="ghost" size="sm"><Link href="/#features">{t("mk.nav.features")}</Link></Button>
          <Button asChild variant="ghost" size="sm"><Link href="/pricing">{t("mk.nav.pricing")}</Link></Button>
          <Button asChild variant="ghost" size="sm"><Link href="/find-school">{t("mk.nav.findSchool")}</Link></Button>
        </nav>
        <LanguageToggle className="hidden sm:inline-flex" />
        {signedIn ? (
          <>
            <p className="hidden min-w-0 max-w-48 text-right text-xs leading-tight lg:block">
              <span className="block truncate font-semibold text-navy">{user.name}</span>
              <span className="block truncate text-muted-foreground">{tenant?.name ?? t(`role.${user.role}`)}</span>
            </p>
            <Button asChild size="sm">
              <Link href={roleHome(user.role)}>{t("nav.goDashboard")}</Link>
            </Button>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut aria-hidden="true" />
              <span className="hidden sm:inline">{t("nav.signOut")}</span>
              <span className="sr-only sm:hidden">{t("nav.signOut")}</span>
            </Button>
          </>
        ) : (
          <>
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href="/login">{t("mk.nav.login")}</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/signup">{t("mk.nav.signup")}</Link>
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
