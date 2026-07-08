import { ArrowRight, LayoutGrid } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MODULE_GUIDES } from "@/data/helpData";
import { cn } from "@/lib/utils";

export function ModuleHelpGuides({ query = "" }: { query?: string }) {
  const q = query.trim().toLowerCase();
  const filtered = q
    ? MODULE_GUIDES.filter((m) => m.title.toLowerCase().includes(q) || m.description.toLowerCase().includes(q))
    : MODULE_GUIDES;

  return (
    <Card id="module-help-guides" className="scroll-mt-6 rounded-2xl border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Help by Module</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <LayoutGrid className="h-5 w-5 text-muted-foreground/50" />
            <p className="text-[12.5px] text-muted-foreground">No modules match “{query}”.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((mod) => {
              const Icon = mod.icon;
              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => toast.info(`${mod.title} guide is coming soon.`)}
                  className={cn(
                    "group flex flex-col gap-3 rounded-xl border border-border/60 p-4 text-left",
                    "transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-sm",
                  )}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold leading-snug text-foreground">{mod.title}</p>
                    <p className="mt-1 text-[12px] leading-snug text-muted-foreground">{mod.description}</p>
                  </div>
                  <span className="flex items-center gap-1 text-[12px] font-medium text-primary">
                    View guide
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
