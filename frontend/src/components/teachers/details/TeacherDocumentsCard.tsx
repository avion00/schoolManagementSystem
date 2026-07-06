import { Download, Eye, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TeacherDocument } from "@/data/teacherDetailsData";

const STATUS_CFG = {
  Verified: "bg-emerald-50 text-emerald-700 ring-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-400",
  Pending:  "bg-amber-50 text-amber-700 ring-amber-500/30 dark:bg-amber-950/40 dark:text-amber-400",
  Expired:  "bg-rose-50 text-rose-700 ring-rose-500/30 dark:bg-rose-950/40 dark:text-rose-400",
};

export function TeacherDocumentsCard({ documents }: { documents: TeacherDocument[] }) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[14px] font-semibold">Documents</CardTitle>
          <span className="text-[12px] text-muted-foreground">{documents.length} files</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="group flex items-center gap-3 rounded-xl border border-border/50 bg-muted/20 p-3 transition-all hover:border-border hover:bg-muted/40"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-foreground">{doc.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {doc.type} · {doc.size} · Uploaded {new Date(doc.uploadedOn).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                </p>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${STATUS_CFG[doc.status]}`}>
                {doc.status}
              </span>
              <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-accent">
                  <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
                <button className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-accent">
                  <Download className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
