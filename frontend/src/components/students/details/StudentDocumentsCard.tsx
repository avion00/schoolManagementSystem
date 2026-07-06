import { Download, Eye, FileText } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { StudentDocument } from "@/data/studentDetailsData";
import { cn } from "@/lib/utils";

function StatusBadge({ status }: { status: StudentDocument["status"] }) {
  const cls =
    status === "Verified" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-emerald-500/20" :
    status === "Pending"  ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 ring-amber-500/20" :
    "bg-rose-500/10 text-rose-700 dark:text-rose-400 ring-rose-500/20";
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset", cls)}>
      {status}
    </span>
  );
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
}

export function StudentDocumentsCard({ documents }: { documents: StudentDocument[] }) {
  return (
    <TooltipProvider delayDuration={300}>
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <FileText className="h-4 w-4 text-primary" />
            Documents
            <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
              {documents.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  {["Document", "Uploaded", "Size", "Status", "Actions"].map((h) => (
                    <TableHead key={h} className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id} className="group">
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                          <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-sm font-medium text-foreground">{doc.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{fmt(doc.uploadedDate)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{doc.size ?? "—"}</TableCell>
                    <TableCell><StatusBadge status={doc.status} /></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-blue-500/10 hover:text-blue-600"
                              onClick={() => toast.info(`View ${doc.name}`)}
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top">View</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-emerald-500/10 hover:text-emerald-600"
                              onClick={() => toast.info(`Download ${doc.name}`)}
                            >
                              <Download className="h-3.5 w-3.5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top">Download</TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
