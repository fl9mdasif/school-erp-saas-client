/** Same rules as the server: split camelCase, lowercase, spaces and underscores to hyphens, collapse hyphens. */
export const normalizeSlug = (input: string): string =>
  input
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

/** Alternatives to offer when an address is taken, for example bright-model-2 and bright-model-dhaka. */
export const slugSuggestions = (slug: string, district?: string): string[] => {
  const out = [`${slug}-2`];
  const d = district ? normalizeSlug(district) : "";
  if (d) out.push(`${slug}-${d}`);
  else out.push(`${slug}-school`);
  return out.map((s) => s.slice(0, 40));
};
