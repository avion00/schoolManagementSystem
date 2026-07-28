import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Reveal } from "@/components/motion";
import { StudentSectionHeader } from "@/components/student/ui/StudentSectionHeader";
import { cn } from "@/lib/utils";

export interface StudentNoticePreview {
  id: string;
  title: string;
  category: string;
  date: string;
  unread: boolean;
}

/** Right-column "latest notices" preview card — shows a couple of items + a View All link. */
export function StudentNoticeCard({ notices, viewAllTo = "/student/notices" }: { notices: StudentNoticePreview[]; viewAllTo?: string }) {
  const navigate = useNavigate();
  return (
    <Reveal>
      <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-elevated">
        <StudentSectionHeader
          icon={Bell}
          title="Notices"
          className="mb-2"
          action={
            <button type="button" onClick={() => navigate(viewAllTo)} className="text-[12px] font-medium text-primary hover:underline">
              View All
            </button>
          }
        />
        <div className="space-y-1">
          {notices.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => navigate(viewAllTo)}
              className="flex w-full items-start gap-2.5 rounded-xl px-2 py-2 text-left transition-colors hover:bg-muted/40"
            >
              <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", n.unread ? "bg-primary" : "bg-transparent")} />
              <div className="min-w-0 flex-1">
                <p className={cn("truncate text-[12.5px]", n.unread ? "font-semibold text-foreground" : "font-medium text-foreground/80")}>
                  {n.title}
                </p>
                <p className="text-[10.5px] text-muted-foreground">{n.category} · {n.date}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </Reveal>
  );
}
