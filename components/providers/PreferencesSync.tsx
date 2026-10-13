"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setBanglaDigits, setLanguage } from "@/redux/slices/uiSlice";

const LANG_KEY = "asm_lang";
const DIGITS_KEY = "asm_bn_digits";

// Language and digit style are preferences, not secrets, so localStorage is fine here.
// Tokens and personal data never go there.
const read = (key: string): string | null => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};
const write = (key: string, value: string) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* private mode: the preference just lasts for this visit */
  }
};

export function PreferencesSync() {
  const dispatch = useAppDispatch();
  const language = useAppSelector((s) => s.ui.language);
  const banglaDigits = useAppSelector((s) => s.ui.banglaDigits);

  useEffect(() => {
    const lang = read(LANG_KEY);
    if (lang === "bn" || lang === "en") dispatch(setLanguage(lang));
    dispatch(setBanglaDigits(read(DIGITS_KEY) === "1"));
  }, [dispatch]);

  useEffect(() => {
    document.documentElement.lang = language;
    write(LANG_KEY, language);
  }, [language]);

  useEffect(() => {
    write(DIGITS_KEY, banglaDigits ? "1" : "0");
  }, [banglaDigits]);

  return null;
}
