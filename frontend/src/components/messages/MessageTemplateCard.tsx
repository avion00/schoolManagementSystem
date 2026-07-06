import { FileText, Edit2, Zap, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MessageTemplate } from "@/data/messagesData";

const CAT_COLORS: Record<string, string> = {
  "Fee Reminder":     "bg-amber-50  text-amber-700  dark:bg-amber-950/40  dark:text-amber-300",
  "Exam Notice":      "bg-blue-50   text-blue-700   dark:bg-blue-950/40   dark:text-blue-300",
  "Attendance Alert": "bg-rose-50   text-rose-700   dark:bg-rose-950/40   dark:text-rose-300",
  "Parent Meeting":   "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
  "Announcement":     "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  "Academic Notice":  "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300",
  "Emergency":        "bg-red-50    text-red-700    dark:bg-red-950/40    dark:text-red-300",
  "General":          "bg-slate-100 text-slate-600  dark:bg-slate-800     dark:text-slate-300",
};

interface Props {
  template: MessageTemplate;
}

export function MessageTemplateCard({ template }: Props) {
  const navigate = useNavigate();
  const catCls = CAT_COLORS[template.category] ?? CAT_COLORS["General"];

  function useTemplate() {
    navigate("/messages/compose", { state: { template } });
  }

  return (
    <Card className="flex flex-col gap-4 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", catCls)}>
          {template.category}
        </span>
      </div>

      <div className="flex-1">
        <h3 className="text-[14px] font-semibold text-foreground">{template.title}</h3>
        <p className="mt-1 text-[12px] font-medium text-muted-foreground">{template.subject}</p>
        <p className="mt-2 text-[12px] text-muted-foreground line-clamp-3 leading-relaxed">
          {template.body.split("\n")[0]}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {template.tags.map((t) => (
          <span key={t} className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            {t}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-2 text-[11px] text-muted-foreground border-t border-border pt-3">
        <Zap className="h-3.5 w-3.5" />
        <span>Used {template.usageCount} times</span>
        {template.lastUsed && (
          <>
            <span className="mx-1">·</span>
            <Clock className="h-3.5 w-3.5" />
            <span>Last: {template.lastUsed}</span>
          </>
        )}
      </div>

      <div className="flex gap-2">
        <Button size="sm" className="flex-1 h-8 text-[12px]" onClick={useTemplate}>
          <Zap className="mr-1.5 h-3.5 w-3.5" />
          Use Template
        </Button>
        <Button size="sm" variant="outline" className="h-8 w-8 p-0">
          <Edit2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </Card>
  );
}
