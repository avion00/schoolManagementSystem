/**
 * Notices: staff notice board (manage, publish, recipients) and readers'
 * notices (/me/notices). API access, mapping, query hooks.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { del, get, getAll, patch, post, type Page, type Schemas } from "./http";
import type {
  AudienceType, Notice, NoticeAttachment, NoticeCategory, NoticePriority, NoticeStatus, RecipientRecord,
} from "./types/notices";

type ApiNotice = Schemas["Notice"];
type StoredFile = Schemas["StoredFile"];

const cap = <T extends string>(v: string | null | undefined, fallback: T) =>
  (v ? (v.charAt(0).toUpperCase() + v.slice(1)) : fallback) as T;

export const AUDIENCE_LABEL: Record<string, AudienceType> = {
  all: "All", students: "Students", parents: "Parents", teachers: "Teachers", staff: "Staff",
  students_parents: "Students & Parents",
};
export const AUDIENCE_VALUE: Record<AudienceType, string> = Object.fromEntries(
  Object.entries(AUDIENCE_LABEL).map(([k, v]) => [v, k])) as Record<AudienceType, string>;

function fileType(f: StoredFile): NoticeAttachment["type"] {
  const kind = f.kind ?? "";
  if (kind === "pdf") return "PDF";
  if (kind === "image") return "Image";
  if (kind === "sheet") return "Spreadsheet";
  if (kind === "doc" || kind === "slides" || kind === "text") return "Document";
  return "File";
}

export function fileSize(bytes: number | null | undefined): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function mapAttachment(f: StoredFile): NoticeAttachment {
  return { id: f.id, name: f.original_name, type: fileType(f), size: fileSize(f.size), downloadUrl: f.download_url };
}

function splitDateTime(iso: string | null | undefined) {
  if (!iso) return { date: "", time: "" };
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
  };
}

export function mapNotice(n: ApiNotice, names?: { classes: Map<string, string>; sections: Map<string, string> }): Notice {
  const when = splitDateTime(n.publish_at);
  const classIds = (n.target_class_levels ?? []) as string[];
  const sectionIds = (n.target_sections ?? []) as string[];
  return {
    id: n.id, noticeId: n.code, title: n.title,
    category: cap<NoticeCategory>(n.category, "General"),
    priority: cap<NoticePriority>(n.priority, "Normal"),
    status: cap<NoticeStatus>(n.status, "Draft"),
    audience: AUDIENCE_LABEL[n.audience ?? "all"] ?? "All",
    targetClassIds: classIds, targetSectionIds: sectionIds,
    targetClasses: classIds.map((id) => names?.classes.get(id) ?? "").filter(Boolean),
    targetSections: sectionIds.map((id) => names?.sections.get(id) ?? "").filter(Boolean),
    summary: n.summary ?? "", body: n.body ?? "", importantInstructions: n.instructions || undefined,
    externalLink: n.external_link || undefined,
    publishedBy: n.published_by_name ?? "", createdBy: n.created_by_name ?? "", createdAt: n.created_at,
    publishAt: n.publish_at ?? null, publishDate: n.status === "draft" && !n.publish_at ? "" : when.date,
    publishTime: n.status === "draft" && !n.publish_at ? "" : when.time,
    expiryDate: n.expires_on || undefined, pinned: !!n.pinned,
    requiresAcknowledgement: !!n.requires_acknowledgement,
    sendNotification: n.send_notification ?? true, sendEmail: !!n.send_email, sendSms: !!n.send_sms,
    attachments: (n.attachments ?? []).map(mapAttachment),
    stats: { totalRecipients: null, read: n.read_count ?? 0, unread: null, acknowledged: n.acknowledged_count ?? 0 },
    internalNotes: n.internal_notes || undefined,
  };
}

async function nameMaps() {
  const [classes, sections] = await Promise.all([
    getAll<Schemas["ClassLevel"]>("/academics/class-levels/"),
    getAll<Schemas["Section"]>("/academics/sections/"),
  ]);
  return {
    classes: new Map(classes.map((c) => [c.id, c.name])),
    sections: new Map(sections.map((s) => [s.id, `${s.class_level_name} ${s.name}`])),
  };
}

export function useNotices() {
  return useQuery({
    queryKey: ["notices", "list"],
    queryFn: async () => {
      const [rows, names] = await Promise.all([getAll<ApiNotice>("/notices/"), nameMaps()]);
      return rows.map((n) => mapNotice(n, names));
    },
    staleTime: 30_000,
  });
}

interface ApiRecipient {
  user: string; name: string; email: string; role: string; class_section: string;
  read_at: string | null; acknowledged_at: string | null;
}

export function useNotice(id: string | undefined) {
  return useQuery({
    queryKey: ["notices", "detail", id],
    queryFn: async () => {
      const [n, names] = await Promise.all([get<ApiNotice>(`/notices/${id}/`), nameMaps()]);
      const notice = mapNotice(n, names);
      if (notice.status !== "Draft") {
        const recipients: ApiRecipient[] = [];
        let stats = { total: 0, read: 0, unread: 0, acknowledged: 0 };
        for (let page = 1; ; page += 1) {
          const r = await get<Page<ApiRecipient> & { stats: typeof stats }>(`/notices/${id}/recipients/`, { page, page_size: 200 });
          recipients.push(...r.results);
          stats = r.stats;
          if (!r.next || page >= 10) break;   // first 2,000 recipients are listed; stats cover everyone
        }
        notice.stats = { totalRecipients: stats.total, read: stats.read, unread: stats.unread, acknowledged: stats.acknowledged };
        return { notice, recipients: recipients.map(mapRecipient) };
      }
      return { notice, recipients: [] as RecipientRecord[] };
    },
    enabled: !!id,
  });
}

function mapRecipient(r: ApiRecipient): RecipientRecord {
  return {
    id: r.user, name: r.name, email: r.email,
    role: cap<RecipientRecord["role"]>(r.role, "Staff"), classSection: r.class_section,
    readStatus: r.read_at ? "Read" : "Unread",
    readTime: r.read_at ? new Date(r.read_at).toLocaleString() : undefined,
    acknowledged: !!r.acknowledged_at,
  };
}

/** The raw record, for the edit form. */
export function useNoticeRecord(id: string | undefined) {
  return useQuery({ queryKey: ["notices", "record", id], queryFn: () => get<ApiNotice>(`/notices/${id}/`), enabled: !!id });
}

function useNoticeMutation<V, R>(fn: (v: V) => Promise<R>) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: () => qc.invalidateQueries({ queryKey: ["notices"] }) });
}

export function useSaveNotice() {
  return useNoticeMutation((v: { id?: string; body: Record<string, unknown> }) =>
    v.id ? patch<ApiNotice>(`/notices/${v.id}/`, v.body) : post<ApiNotice>("/notices/", v.body));
}

export function usePublishNotice() {
  return useNoticeMutation((id: string) => post<ApiNotice & { notified: number }>(`/notices/${id}/publish/`));
}

export function useArchiveNotice() {
  return useNoticeMutation((id: string) => post<ApiNotice>(`/notices/${id}/archive/`));
}

export function useDeleteNotice() {
  return useNoticeMutation((id: string) => del(`/notices/${id}/`));
}

// ── readers ──────────────────────────────────────────────────────────────────

type ApiMyNotice = Schemas["MyNotice"];

export interface MyNotice extends Notice { readAt: string | null; acknowledgedAt: string | null }

export function mapMyNotice(n: ApiMyNotice): MyNotice {
  const base = mapNotice({ ...n, status: "published", audience: "all", target_class_levels: [], target_sections: [] } as unknown as ApiNotice);
  return { ...base, readAt: n.read_at ?? null, acknowledgedAt: n.acknowledged_at ?? null };
}

export function useMyNotices() {
  return useQuery({
    queryKey: ["notices", "mine"],
    queryFn: async () => (await getAll<ApiMyNotice>("/me/notices/")).map(mapMyNotice),
    staleTime: 30_000,
  });
}

export function useMyNotice(id: string | undefined) {
  const qc = useQueryClient();
  return useQuery({
    queryKey: ["notices", "mine", id],
    queryFn: async () => {
      const n = mapMyNotice(await get<ApiMyNotice>(`/me/notices/${id}/`));  // opening marks it read
      qc.invalidateQueries({ queryKey: ["notices", "mine"], exact: true });
      return n;
    },
    enabled: !!id,
  });
}

export function useAcknowledgeNotice() {
  return useNoticeMutation((id: string) => post<{ acknowledged_at: string }>(`/me/notices/${id}/acknowledge/`));
}

/** Row actions shared by the card grid and the table. */
export function useNoticeActions() {
  const save = useSaveNotice();
  const remove = useDeleteNotice();
  return {
    pending: save.isPending || remove.isPending,
    /** Copy as a new draft; resolves to the new notice id. */
    duplicate: async (id: string) => {
      const n = await get<ApiNotice>(`/notices/${id}/`);
      const copy = await save.mutateAsync({ body: {
        title: `Copy of ${n.title}`.slice(0, 200), category: n.category, priority: n.priority, audience: n.audience,
        target_class_levels: n.target_class_levels, target_sections: n.target_sections, summary: n.summary,
        body: n.body, instructions: n.instructions, external_link: n.external_link, pinned: n.pinned,
        requires_acknowledgement: n.requires_acknowledgement, send_notification: n.send_notification,
        send_email: n.send_email, send_sms: n.send_sms, internal_notes: n.internal_notes,
        attachment_ids: (n.attachments ?? []).map((a) => a.id),
      } });
      return copy.id;
    },
    remove: (id: string) => remove.mutateAsync(id),
  };
}
