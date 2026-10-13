"use client";

import Link from "next/link";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Brand } from "@/components/layout/Brand";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/useT";

export function MarketingHeader() {
  const { t } = useT();
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
        <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
          <Link href="/login">{t("mk.nav.login")}</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/signup">{t("mk.nav.signup")}</Link>
        </Button>
      </div>
    </header>
  );
}
