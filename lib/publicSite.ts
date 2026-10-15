// Server-side only: reads API_BASE_URL directly (no NEXT_PUBLIC_ prefix), so this must never be
// imported from a "use client" file.
const API_BASE = process.env.API_BASE_URL ?? "http://localhost:5000";

export type TPublicSite = {
  school: { name?: string; nameBn?: string; slug?: string; type?: "school" | "madrasa" | "coaching"; logoUrl?: string; district?: string; upazila?: string };
  theme: { primaryColor: string; template: "classic" | "modern" };
  hero?: { title?: string; subtitle?: string; imageUrl?: string };
  about?: string;
  mission?: string;
  headMessage?: { name: string; designation: string; photoUrl?: string; text: string };
  admissionInfo?: { isOpen: boolean; text?: string; classes?: string[]; lastDate?: string };
  contact?: { phone?: string; email?: string; address?: string; mapUrl?: string };
  gallery: { url: string; caption?: string }[];
  social?: { facebook?: string; youtube?: string };
  seo?: { title?: string; description?: string };
  sectionsVisible?: { about?: boolean; teachers?: boolean; notices?: boolean; gallery?: boolean; admission?: boolean; results?: boolean };
  resultLookupMode: "roll_dob" | "roll_only" | "student_id_dob";
};

export type TPublicNotice = { _id: string; title: string; body: string; attachments?: { url: string; name?: string }[]; publishAt: string };
export type TPublicStaff = { _id: string; name: string; designation: string; photoUrl?: string; bio?: string };
export type TPublicExam = { id: string; name: string; classes: { id: string; name?: string }[] };

async function publicGet<T>(slug: string, path: string, params?: Record<string, string>): Promise<T | null> {
  const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
  const res = await fetch(`${API_BASE}/api/v1/public/schools/${slug}${path}${qs}`, { next: { revalidate: 60 } });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data as T;
}

export const getPublicSite = (slug: string) => publicGet<TPublicSite>(slug, "");
export const getPublicNotices = (slug: string, page = 1) => publicGet<TPublicNotice[]>(slug, "/notices", { page: String(page), limit: "20" });
export const getPublicNotice = async (slug: string, id: string) => {
  const list = await getPublicNotices(slug, 1);
  return list?.find((n) => n._id === id) ?? null;
};
export const getPublicStaff = (slug: string) => publicGet<TPublicStaff[]>(slug, "/staff");
export const getPublicExams = (slug: string) => publicGet<TPublicExam[]>(slug, "/exams");
