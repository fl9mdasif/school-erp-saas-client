export type TStrength = "weak" | "okay" | "strong";

/** A simple hint, not a rule. The only hard rule is the 8 character minimum the server enforces. */
export const passwordStrength = (pw: string): { level: TStrength; score: number } => {
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (pw.length >= 12) score += 1;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 1;
  if (/\d/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  const level: TStrength = score <= 2 ? "weak" : score <= 3 ? "okay" : "strong";
  return { level, score };
};
