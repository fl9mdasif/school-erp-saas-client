import { instance } from "@/helpers/axios/axiosInstance";

const baseURL = process.env.NEXT_PUBLIC_BACKEND_API_URL ?? "/api/v1";

/**
 * Fetches a file through the authenticated client (so the Bearer token is sent) and saves it.
 * The response interceptor passes blobs through as { data }, so the file name comes from the caller.
 */
export async function downloadFile(path: string, fileName: string, params?: Record<string, unknown>) {
  const res = (await instance.get(`${baseURL}${path}`, { params, responseType: "blob" })) as unknown as { data: Blob };
  const href = URL.createObjectURL(res.data);
  const a = document.createElement("a");
  a.href = href;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(href);
}

/** Fetches a file through the authenticated client and returns a blob: URL for an <iframe> or <img>. Caller revokes it. */
export async function fetchFileUrl(path: string, params?: Record<string, unknown>): Promise<string> {
  const res = (await instance.get(`${baseURL}${path}`, { params, responseType: "blob" })) as unknown as { data: Blob };
  return URL.createObjectURL(res.data);
}
