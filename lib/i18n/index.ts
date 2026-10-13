import { common as enCommon } from "./en/common";
import { errors as enErrors } from "./en/errors";
import { nav as enNav } from "./en/nav";
import { upload as enUpload } from "./en/upload";
import { marketing as enMarketing } from "./en/marketing";
import { auth as enAuth } from "./en/auth";
import { common as bnCommon } from "./bn/common";
import { errors as bnErrors } from "./bn/errors";
import { nav as bnNav } from "./bn/nav";
import { upload as bnUpload } from "./bn/upload";
import { marketing as bnMarketing } from "./bn/marketing";
import { auth as bnAuth } from "./bn/auth";

// Each module adds its own file under en/ and bn/ and spreads it here. The Bangla file is typed
// from the English one, so a missing Bangla string is a compile error.
export const en = { ...enCommon, ...enErrors, ...enNav, ...enUpload, ...enMarketing, ...enAuth };
export const bn: Record<TKey, string> = { ...bnCommon, ...bnErrors, ...bnNav, ...bnUpload, ...bnMarketing, ...bnAuth };

export type TKey = keyof typeof en;
export type TLang = "bn" | "en";

export const dictionary: Record<TLang, Record<TKey, string>> = { en, bn };

/** Default words for the labels the tenant can rename (class / batch, section / group, ...). */
export const defaultTerms: Record<string, { en: string; bn: string }> = {
  class: { en: "Class", bn: "শ্রেণি" },
  section: { en: "Section", bn: "শাখা" },
  roll: { en: "Roll", bn: "রোল" },
  student: { en: "Student", bn: "শিক্ষার্থী" },
  teacher: { en: "Teacher", bn: "শিক্ষক" },
};
