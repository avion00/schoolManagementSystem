import { api } from "@/lib/api";

import type { Schemas } from "./http";

export type StoredFile = Schemas["StoredFile"];

/** Upload one file (validated server-side) and return its record. */
export async function uploadFile(file: File): Promise<StoredFile> {
  const body = new FormData();
  body.append("file", file);
  const { data } = await api.post<StoredFile>("/files/", body, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

/** Download a protected file through the authenticated client and save it. */
export async function downloadFile(file: StoredFile): Promise<void> {
  const res = await api.get(file.download_url.replace(/^\/api\/v1/, ""), { responseType: "blob" });
  const url = URL.createObjectURL(res.data as Blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.original_name;
  a.click();
  URL.revokeObjectURL(url);
}

/** Object URL for showing a protected image (e.g. a photo) inline. */
export async function fileObjectUrl(downloadUrl: string): Promise<string> {
  const res = await api.get(downloadUrl.replace(/^.*\/api\/v1/, ""), { responseType: "blob" });
  return URL.createObjectURL(res.data as Blob);
}
