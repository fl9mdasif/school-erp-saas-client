"use client";

import Link from "next/link";
import { Brand } from "@/components/layout/Brand";
import { useT } from "@/lib/i18n/useT";

export function MarketingFooter() {
  const { t } = useT();
  return (
    <footer className="bg-navy text-sidebar-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <Brand />
          <p className="mt-2 text-sm text-sidebar-muted">{t("mk.footer.tagline")}</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link className="py-2 hover:text-white" href="/pricing">{t("mk.nav.pricing")}</Link>
          <Link className="py-2 hover:text-white" href="/find-school">{t("mk.nav.findSchool")}</Link>
          <Link className="py-2 hover:text-white" href="/terms">{t("mk.footer.terms")}</Link>
          <Link className="py-2 hover:text-white" href="/privacy">{t("mk.footer.privacy")}</Link>
          <Link className="py-2 hover:text-white" href="/contact">{t("mk.footer.contact")}</Link>
          <Link className="py-2 hover:text-white" href="/platform/login">{t("mk.footer.platform")}</Link>
        </nav>
      </div>
    </footer>
  );
}
