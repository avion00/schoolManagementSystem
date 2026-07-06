import { Download, Eye, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ClassDocument } from "@/data/classDetailData";

const STATUS_CFG = {
  Available: "bg-emerald-50 text-emerald-700 ring-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-400",
  Draft:     "bg-amber-50 text-amber-700 ring-amber-500/30 dark:bg-amber-950/40 dark:text-amber-400",
  Archived:  "bg-muted text-muted-foreground ring-border/30",
};
const TYPE_COLOR: Record<string, string> = {
  PDF: "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400",
  DOC: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400",
  XLS: "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400",
};

export function ClassDocumentsCard({ documents }: { documents: ClassDocument[] }) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[14px] font-semibold">Documents</CardTitle>
          <span className="text-[11px] text-muted-foreground">{documents.filter(d=>d.status==="Available").length} of {documents.length} available</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {documents.map((doc) => (
          <div key={doc.id} className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/30 px-4 py-3 hover:bg-muted/50 transition-colors">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold ${TYPE_COLOR[doc.type] ?? "bg-muted text-muted-foreground"}`}>
              {doc.type}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-foreground">{doc.name}</p>
              <p className="text-[11px] text-muted-foreground">
                {doc.size} · {new Date(doc.uploadedOn).toLocaleDateString("en-US", { day:"numeric", month:"short", year:"numeric" })}
              </p>
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${STATUS_CFG[doc.status]}`}>
              {doc.status}
            </span>
            <div className="flex gap-1 shrink-0">
              <Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="h-3 w-3" /></Button>
              <Button variant="ghost" size="icon" className="h-7 w-7"><Download className="h-3 w-3" /></Button>
            </div>
          </div>
        ))}
        {documents.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
            <FileText className="h-8 w-8" />
            <p className="text-sm">No documents uploaded yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
