import { authKey } from "@/contains/authKey";

// A non-secret cookie that only says "this browser has a session". proxy.ts reads it to redirect
// early and avoid a flash of the wrong page. It carries no token and grants nothing: the API decides.
export const setSessionFlag = () => {
  if (typeof document === "undefined") return;
  document.cookie = `${authKey}=1; path=/; SameSite=Lax; max-age=${60 * 60 * 24 * 30}`;
};

export const clearSessionFlag = () => {
  if (typeof document === "undefined") return;
  document.cookie = `${authKey}=; path=/; SameSite=Lax; max-age=0`;
};
