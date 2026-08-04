import { FileText } from "lucide-react";

import { StudentStatusPill, type StudentPillTone } from "@/components/student/ui/StudentStatusPill";

export type StudentDocumentStatus = "Verified" | "Uploaded" | "Pending Review" | "Missing";

const STATUS_TONE: Record<StudentDocumentStatus, StudentPillTone> = {
  Verified: "success", Uploaded: "info", "Pending Review": "warning", Missing: "danger",
};

export interface StudentDocumentItem {
  id: string;
  name: string;
  status: StudentDocumentStatus;
  updatedOn: string;
}

/** One row in the document center list — name, status badge, last-updated date, action. */
export function StudentDocumentRow({ document, onAction }: { document: StudentDocumentItem; onAction: (doc: StudentDocumentItem) => void }) {
  const actionLabel = document.status === "Missing" ? "Request Upload" : document.status === "Pending Review" ? "View" : "Download";
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/60 px-3.5 py-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <FileText className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-foreground">{document.name}</p>
        <p className="text-[11px] text-muted-foreground">Updated {document.updatedOn}</p>
      </div>
      <StudentStatusPill label={document.status} tone={STATUS_TONE[document.status]} className="shrink-0" />
      <button
        type="button"
        onClick={() => onAction(document)}
        className="shrink-0 rounded-lg border border-border/60 px-2.5 py-1.5 text-[11.5px] font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
      >
        {actionLabel}
      </button>
    </div>
  );
}
