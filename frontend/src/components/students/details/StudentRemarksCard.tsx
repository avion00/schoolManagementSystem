import { MessageSquare } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Remark } from "@/data/studentDetailsData";
import { cn } from "@/lib/utils";

const TYPE_CONFIG = {
  positive: { dot: "bg-emerald-500", label: "Positive", badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" },
  neutral:  { dot: "bg-amber-500",   label: "Note",     badge: "bg-amber-500/10 text-amber-700 dark:text-amber-400"       },
  warning:  { dot: "bg-rose-500",    label: "Follow-up",badge: "bg-rose-500/10 text-rose-700 dark:text-rose-400"          },
};

function fmt(d: string) {
  return new Date(d).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
}

export function StudentRemarksCard({ remarks }: { remarks: Remark[] }) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <MessageSquare className="h-4 w-4 text-primary" />
          Teacher Remarks
          <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
            {remarks.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-5">
          {/* Connector rail */}
          <div className="absolute left-3.5 top-6 h-[calc(100%-32px)] w-px bg-border/50" aria-hidden="true" />

          {remarks.map((r) => {
            const cfg = TYPE_CONFIG[r.type];
            return (
              <div key={r.id} className="relative flex gap-4">
                {/* Timeline dot */}
                <div className={cn("relative z-10 mt-1 h-7 w-7 shrink-0 rounded-full border-2 border-background", cfg.dot)} />

                {/* Content */}
                <div className="min-w-0 flex-1 rounded-xl border border-border/50 bg-muted/20 p-3.5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{r.author}</p>
                      <p className="text-[11px] text-muted-foreground">{r.role}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", cfg.badge)}>
                        {cfg.label}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{fmt(r.date)}</span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/80">{r.content}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
