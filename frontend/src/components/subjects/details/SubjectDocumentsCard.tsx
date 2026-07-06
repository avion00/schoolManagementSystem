import { Download, Eye, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SubjectDocument } from "@/data/subjectDetailData";

const TYPE_COLOR: Record<string, string> = {
  PDF: "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400",
  DOC: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  XLS: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  JPG: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  PNG: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400",
};

const STATUS_CFG: Record<string, string> = {
  Available: "bg-emerald-50 text-emerald-700 ring-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-400",
  Draft:     "bg-amber-50 text-amber-700 ring-amber-500/30 dark:bg-amber-950/40 dark:text-amber-400",
  Archived:  "bg-muted text-muted-foreground ring-border/30",
};

function Badge({ label, cls }: { label: string; cls: string }) {
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${cls}`}>{label}</span>;
}

export function SubjectDocumentsCard({ documents }: { documents: SubjectDocument[] }) {
  const available = documents.filter((d) => d.status === "Available").length;

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[14px] font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            Documents
          </CardTitle>
          <span className="text-[11px] text-muted-foreground">{available} available · {documents.length} total</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {documents.map((doc) => (
            <div key={doc.id}
              className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-3 shadow-sm">
              {/* type icon */}
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-[10px] font-bold ${TYPE_COLOR[doc.type] ?? "bg-muted text-muted-foreground"}`}>
                {doc.type}
              </div>
              {/* info */}
              <div className="flex-1 min-w-0">
                <p className="truncate text-[12.5px] font-medium text-foreground">{doc.name}</p>
                <p className="text-[11px] text-muted-foreground">{doc.size} · {doc.uploadedOn}</p>
              </div>
              {/* status */}
              <Badge label={doc.status} cls={STATUS_CFG[doc.status]} />
              {/* actions */}
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-7 w-7"><Eye      className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7"><Download className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          ))}
        </div>
        {documents.length === 0 && (
          <p className="py-8 text-center text-[13px] text-muted-foreground">No documents uploaded.</p>
        )}
      </CardContent>
    </Card>
  );
}
