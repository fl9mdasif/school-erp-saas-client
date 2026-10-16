/** The product brand. Fixed in code on purpose, so a stale host env value can never show an old name. */
export const BRAND_NAME = "Digital Pathshala";
export const BRAND_NAME_BN = "ডিজিটাল পাঠশালা";
export const BRAND_MARK = "পা";
/** Public address shown in the signup preview, e.g. digitalpathshala.com/schools/<name>. */
export const BRAND_DOMAIN = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "digitalpathshala.com";
