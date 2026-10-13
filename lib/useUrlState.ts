"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

/**
 * Filters and the page number live in the URL, so the back button, a refresh and a shared link all
 * keep the same view. A value equal to its default is left out of the URL to keep it short.
 * Pages that use this must render inside <Suspense>.
 */
export function useUrlState<T extends Record<string, string>>(defaults: T) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const get = useCallback((key: keyof T & string): string => params.get(key) ?? defaults[key] ?? "", [params, defaults]);

  const set = useCallback(
    (patch: Partial<Record<keyof T & string, string>>, opts: { resetPage?: boolean } = { resetPage: true }) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(patch) as [string, string][]) {
        if (value === "" || value === defaults[key]) next.delete(key);
        else next.set(key, value);
      }
      if (opts.resetPage && !("page" in patch)) next.delete("page");
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [params, defaults, pathname, router]
  );

  return { get, set };
}
