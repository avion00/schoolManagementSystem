import { CalendarDays, Clock, Download, FolderOpen, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { PremiumBadge } from "@/components/ui/PremiumBadge";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { Button } from "@/components/ui/button";
import type { StudentExam } from "@/data/studentDashboardData";

function daysUntil(dateStr: string) {
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000);
  if (diff < 0) return null;
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return `In ${diff} days`;
}

export function StudentExamCard({ exam }: { exam: StudentExam }) {
  const navigate = useNavigate();
  const countdown = exam.status === "Upcoming" ? daysUntil(exam.date) : null;

  return (
    <PremiumCard className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-[13.5px] font-semibold text-foreground">{exam.subject}</p>
            <PremiumBadge label={exam.examType} tone="info" />
          </div>
          <p className="mt-1 flex items-center gap-1 text-[11.5px] text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" /> {exam.date}
            <Clock className="ml-2 h-3.5 w-3.5" /> {exam.time}
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-[11.5px] text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" /> {exam.room} · Full marks {exam.fullMarks}
          </p>
        </div>
        {countdown && <PremiumBadge label={countdown} tone="warning" />}
        {exam.status === "Completed" && <PremiumBadge label="Completed" tone="neutral" />}
      </div>

      <div className="mt-3 flex flex-wrap gap-2 border-t border-border/60 pt-3">
        <Button size="sm" variant="outline" className="h-8 gap-1 text-[12px]" onClick={() => toast.info(`${exam.subject} ${exam.examType} — ${exam.date} at ${exam.time}, ${exam.room}.`)}>
          View details
        </Button>
        <Button size="sm" variant="outline" className="h-8 gap-1 text-[12px]" onClick={() => toast.success("Downloading exam routine…")}>
          <Download className="h-3.5 w-3.5" /> Download routine
        </Button>
        <Button size="sm" variant="ghost" className="h-8 gap-1 text-[12px] text-muted-foreground" onClick={() => navigate("/student/materials")}>
          <FolderOpen className="h-3.5 w-3.5" /> View materials
        </Button>
      </div>
    </PremiumCard>
  );
}
