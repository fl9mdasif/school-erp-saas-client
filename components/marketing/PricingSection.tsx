"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { ErrorState } from "@/components/common/ErrorState";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMoney } from "@/lib/format";
import { useT } from "@/lib/i18n/useT";
import { useGetPublicPlansQuery } from "@/redux/api/publicApi";
import { useAppSelector } from "@/redux/hooks";

/** Plans come from the API so the owner can change prices without a deploy. */
export function PricingSection({ withHeading = true }: { withHeading?: boolean }) {
  const { t, lang } = useT();
  const banglaDigits = useAppSelector((s) => s.ui.banglaDigits);
  const { data, isLoading, isError, error, refetch } = useGetPublicPlansQuery();
  const fmt = { lang, banglaDigits } as const;

  return (
    <section id="pricing" className="mx-auto max-w-6xl px-4 py-16">
      {withHeading ? (
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-2xl font-semibold md:text-3xl">{t("mk.pricing.title")}</h2>
          <p className="mt-2 text-muted-foreground">{t("mk.pricing.subtitle")}</p>
        </div>
      ) : null}

      {isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {isLoading || !data
            ? Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="space-y-3 p-6">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-9 w-32" />
                  <Skeleton className="h-4 w-40" />
                </Card>
              ))
            : data.map((plan) => (
                <Card key={plan._id} className={`flex flex-col p-6 ${plan.isPopular ? "border-primary ring-1 ring-primary" : ""}`}>
                  {plan.isPopular ? (
                    <span className="mb-3 inline-flex w-fit rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-white">
                      {t("mk.pricing.popular")}
                    </span>
                  ) : null}
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <p className="mt-3">
                    <span className="tabular text-3xl font-bold text-navy">{formatMoney(plan.monthlyPrice * 100, fmt).replace(/\.00$/, "").replace(/\.০০$/, "")}</span>
                    <span className="ml-1 text-sm text-muted-foreground">{t("mk.pricing.perMonth")}</span>
                  </p>
                  {plan.yearlyPrice > 0 ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatMoney(plan.yearlyPrice * 100, fmt).replace(/\.00$/, "").replace(/\.০০$/, "")} {t("mk.pricing.perYear")}
                    </p>
                  ) : null}
                  <ul className="mt-5 flex-1 space-y-2 text-sm">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button asChild className="mt-6" variant={plan.isPopular ? "default" : "outline"}>
                    <Link href="/signup">{t("mk.pricing.cta")}</Link>
                  </Button>
                </Card>
              ))}
        </div>
      )}
      <p className="mt-6 text-center text-xs text-muted-foreground">{t("mk.pricing.note")}</p>
    </section>
  );
}
