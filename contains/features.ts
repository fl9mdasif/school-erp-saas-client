// Feature flags from NEXT_PUBLIC_FEATURES (comma separated). A hidden feature never appears in
// navigation and its URL redirects to the dashboard home.
// customDomain and sms stay off: the server no longer has those modules.
export type TFeature = "customDomain" | "sms" | "portal" | "promotion" | "audit" | "pdf";

const enabled = new Set(
  (process.env.NEXT_PUBLIC_FEATURES ?? "portal,promotion,audit,pdf")
    .split(",")
    .map((f) => f.trim())
    .filter(Boolean)
);

export const hasFeature = (feature: TFeature): boolean => enabled.has(feature);
