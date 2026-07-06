import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ParentDocument } from "@/data/parentDetailsData";

const STATUS_CFG = {
  Verified: "bg-emerald-50 text-emerald-700 ring-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-400",
  Pending:  "bg-amber-50 text-amber-700 ring-amber-500/30 dark:bg-amber-950/40 dark:text-amber-400",
  Expired:  "bg-rose-50 text-rose-700 ring-rose-500/30 dark:bg-rose-950/40 dark:text-rose-400",
};

const TYPE_COLOR: Record<string, string> = {
  PDF: "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400",
  JPG: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
  PNG: "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400",
  DOC: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400",
};

export function ParentDocumentsCard({ documents }: { documents: ParentDocument[] }) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-[14px] font-semibold">Documents</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {documents.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">No documents uploaded.</p>
        )}
        {documents.map((doc) => (
          <div key={doc.id} className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/30 px-4 py-3 hover:bg-muted/50 transition-colors">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold ${TYPE_COLOR[doc.type] ?? "bg-muted text-muted-foreground"}`}>
              {doc.type}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-foreground">{doc.name}</p>
              <p className="text-[11px] text-muted-foreground">
                {doc.size} · Uploaded {new Date(doc.uploadedOn).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${STATUS_CFG[doc.status]}`}>
              {doc.status}
            </span>
          </div>
        ))}
        {documents.length > 0 && (
          <div className="flex items-center gap-1.5 pt-2 text-[12px] text-muted-foreground">
            <FileText className="h-3.5 w-3.5" />
            <span>{documents.filter((d) => d.status === "Verified").length} of {documents.length} verified</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
