"use client";

import { useCallback } from "react";
import { useAppSelector } from "@/redux/hooks";
import { defaultTerms, dictionary, type TKey } from "./index";

export type TVars = Record<string, string | number>;

/** Pure lookup, also used in tests and outside React. */
export const translate = (lang: "bn" | "en", key: TKey, vars?: TVars): string => {
  const text = dictionary[lang][key] ?? dictionary.en[key] ?? key;
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (_, name: string) =>
    vars[name] !== undefined ? String(vars[name]) : `{${name}}`
  );
};

/**
 * Translations plus the tenant's own words. `term("class")` returns "Class", "Batch", "জামাত" ... as the
 * school configured it. Never write those words by hand in a screen.
 */
export function useT() {
  const lang = useAppSelector((s) => s.ui.language);
  const terminology = useAppSelector((s) => s.auth.tenant?.terminology);

  const t = useCallback((key: TKey, vars?: TVars) => translate(lang, key, vars), [lang]);

  const term = useCallback(
    (name: string): string => {
      const entry = terminology?.[name] ?? defaultTerms[name];
      return entry ? entry[lang] : name;
    },
    [terminology, lang]
  );

  /** Translates a zod message that is a dictionary key (val.*); anything else is shown as it is. */
  const tv = useCallback(
    (message?: string) => (message && message in dictionary.en ? translate(lang, message as TKey) : message),
    [lang]
  );

  return { t, term, tv, lang };
}
