import { useRef, useState } from "react";
import { CheckCircle2, Download, FileText, Loader2, ShieldCheck, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { downloadFile, uploadFile } from "@/api/files";
import { errorMessage } from "@/api/http";
import { useDocumentActions, useStudentDocuments } from "@/api/students";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DOCUMENTS = [
  { kind: "birth_certificate",    name: "Birth Certificate",    required: true  },
  { kind: "transfer_certificate", name: "Transfer Certificate", required: false },
  { kind: "previous_marksheet",   name: "Previous Marksheet",   required: false },
  { kind: "parent_id",            name: "Parent / Guardian ID", required: true  },
  { kind: "medical_form",         name: "Medical Form",         required: false },
  { kind: "address_proof",        name: "Address Proof",        required: false },
];

/** Admission documents on file. Documents attach to a saved student, so in
 *  create mode this explains that instead of pretending to upload. */
export function DocumentChecklist({ studentId, canVerify = false }: { studentId?: string; canVerify?: boolean }) {
  if (!studentId) {
    return (
      <p className="rounded-xl bg-muted/50 px-3.5 py-3 text-xs text-muted-foreground">
        Save the student first, then upload their documents here.
      </p>
    );
  }
  return <Checklist studentId={studentId} canVerify={canVerify} />;
}

function Checklist({ studentId, canVerify }: { studentId: string; canVerify: boolean }) {
  const docs = useStudentDocuments(studentId);
  const actions = useDocumentActions(studentId);
  const [busy, setBusy] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const pendingKind = useRef<string>("");

  const byKind = new Map((docs.data ?? []).map((d) => [d.kind, d]));
  const uploadedCount = DOCUMENTS.filter((d) => byKind.has(d.kind as never)).length;

  async function onFile(file: File | undefined) {
    const kind = pendingKind.current;
    if (!file || !kind) return;
    setBusy(kind);
    try {
      const stored = await uploadFile(file);
      await actions.add.mutateAsync({ kind, fileId: stored.id });
      toast.success("Document uploaded");
    } catch (e) {
      toast.error(errorMessage(e, "Upload failed."));
    } finally {
      setBusy(null);
      if (input.current) input.current.value = "";
    }
  }

  async function run(kind: string, fn: () => Promise<unknown>, ok: string) {
    setBusy(kind);
    try {
      await fn();
      toast.success(ok);
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-3">
      <input ref={input} type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg,.docx"
        onChange={(e) => onFile(e.target.files?.[0])} />

      <div className="flex items-center justify-between rounded-xl bg-muted/50 px-3.5 py-2.5">
        <p className="text-xs font-semibold text-foreground">
          {uploadedCount} / {DOCUMENTS.length} documents uploaded
        </p>
        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${(uploadedCount / DOCUMENTS.length) * 100}%` }} />
        </div>
      </div>

      {DOCUMENTS.map((doc) => {
        const record = byKind.get(doc.kind as never);
        const working = busy === doc.kind;
        return (
          <div key={doc.kind} className={cn(
            "flex items-center gap-3 rounded-xl border p-3.5 transition-colors",
            record ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-800/40 dark:bg-emerald-900/10"
                   : "border-border/60 bg-muted/20",
          )}>
            <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
              record ? "bg-emerald-500/15" : "bg-muted")}>
              {record ? <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      : <FileText className="h-4 w-4 text-muted-foreground" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{doc.name}</p>
              <p className="text-[11px] text-muted-foreground">
                {doc.required ? "Required" : "Optional"}{" · "}
                <span className={cn("font-semibold", record ? "text-emerald-600 dark:text-emerald-400" : "")}>
                  {record ? (record.verified_at ? `Verified by ${record.verified_by_name ?? "staff"}` : "Uploaded · pending verification")
                          : "Not uploaded"}
                </span>
              </p>
            </div>
            {working && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            {record ? (
              <div className="flex shrink-0 gap-1.5">
                <Button type="button" variant="outline" size="sm" className="gap-1.5 text-xs"
                  onClick={() => downloadFile(record.file).catch((e) => toast.error(errorMessage(e)))}>
                  <Download className="h-3.5 w-3.5" /> View
                </Button>
                {canVerify && !record.verified_at && (
                  <Button type="button" variant="outline" size="sm" className="gap-1.5 text-xs" disabled={working}
                    onClick={() => run(doc.kind, () => actions.verify.mutateAsync(record.id), "Marked verified")}>
                    <ShieldCheck className="h-3.5 w-3.5" /> Verify
                  </Button>
                )}
                <Button type="button" variant="outline" size="sm" disabled={working}
                  className="gap-1.5 border-rose-200 text-xs text-rose-600 hover:bg-rose-50 dark:border-rose-800/50 dark:text-rose-400 dark:hover:bg-rose-900/20"
                  onClick={() => run(doc.kind, () => actions.remove.mutateAsync(record.id), "Document removed")}>
                  <X className="h-3.5 w-3.5" /> Remove
                </Button>
              </div>
            ) : (
              <Button type="button" variant="secondary" size="sm" className="shrink-0 gap-1.5 text-xs" disabled={working}
                onClick={() => { pendingKind.current = doc.kind; input.current?.click(); }}>
                <Upload className="h-3.5 w-3.5" /> Upload
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
