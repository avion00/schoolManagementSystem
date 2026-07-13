import { useMemo, useState } from "react";
import { MessageSquare, Phone, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Reveal } from "@/components/motion";
import { StudentAvatar } from "@/components/students/StudentAvatar";
import { ParentMessageTemplate } from "@/components/teacher/ParentMessageTemplate";
import { Button } from "@/components/ui/button";
import { PremiumBadge, type PremiumBadgeTone } from "@/components/ui/PremiumBadge";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { PremiumSearchInput } from "@/components/ui/PremiumSearchInput";
import {
  assignedStudents,
  meetingRequests,
  parentMessages,
  weakStudents,
  type MeetingRequest,
} from "@/data/teacherDashboardData";

const STATUS_TONE: Record<MeetingRequest["status"], PremiumBadgeTone> = {
  Requested: "warning",
  Scheduled: "info",
  Completed: "success",
  Cancelled: "neutral",
};

export function TeacherParents() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const guardians = useMemo(() => {
    const q = search.trim().toLowerCase();
    return assignedStudents
      .filter((s) => !q || s.guardian.toLowerCase().includes(q) || s.name.toLowerCase().includes(q))
      .map((s) => ({
        student: s,
        thread: parentMessages.find((m) => m.context.startsWith(s.name)),
      }));
  }, [search]);

  const followUps = weakStudents.filter((s) => s.reasons.includes("Low attendance") || s.reasons.includes("Missing homework"));
  const recentReplies = parentMessages.filter((m) => !m.unread).slice(0, 3);

  return (
    <div className="space-y-4">
      <Reveal>
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Parent Communication</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Quickly message and follow up with guardians of your assigned students.</p>
        </div>
      </Reveal>

      <Reveal delay={40}>
        <ParentMessageTemplate />
      </Reveal>

      <Reveal delay={60} className="grid gap-4 lg:grid-cols-3">
        <PremiumCard className="p-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Students needing follow-up</p>
          {followUps.length === 0 ? <p className="text-[12.5px] text-muted-foreground">None right now.</p> : (
            <div className="space-y-1.5">
              {followUps.map((s) => (
                <button key={s.studentId} type="button" onClick={() => navigate(`/teacher/students/${s.studentId}`)} className="flex w-full items-center justify-between rounded-lg px-2 py-1 text-left hover:bg-accent/40">
                  <span className="truncate text-[12.5px] text-foreground">{s.name}</span>
                  <span className="text-[11px] text-muted-foreground">{s.className}-{s.section}</span>
                </button>
              ))}
            </div>
          )}
        </PremiumCard>

        <PremiumCard className="p-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Recent parent replies</p>
          {recentReplies.length === 0 ? <p className="text-[12.5px] text-muted-foreground">No recent replies.</p> : (
            <div className="space-y-2">
              {recentReplies.map((m) => (
                <div key={m.id} className="text-[12px]">
                  <p className="font-medium text-foreground">{m.from}</p>
                  <p className="truncate text-muted-foreground">{m.preview}</p>
                </div>
              ))}
            </div>
          )}
        </PremiumCard>

        <PremiumCard className="p-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Meeting requests</p>
          <div className="space-y-1.5">
            {meetingRequests.map((m) => (
              <div key={m.id} className="flex items-center justify-between gap-2 text-[12px]">
                <span className="truncate text-foreground">{m.withName}</span>
                <PremiumBadge label={m.status} tone={STATUS_TONE[m.status]} />
              </div>
            ))}
          </div>
        </PremiumCard>
      </Reveal>

      <Reveal delay={100}>
        <PremiumSearchInput value={search} onChange={setSearch} placeholder="Search by guardian or student name…" className="max-w-sm" />
      </Reveal>

      <Reveal delay={140} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {guardians.map(({ student, thread }, i) => (
          <PremiumCard key={student.id} className="t-row-in flex flex-col gap-3 p-4" style={{ "--row-index": i } as React.CSSProperties}>
            <div className="flex items-center gap-3">
              <StudentAvatar name={student.name} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-foreground">{student.guardian}</p>
                <p className="truncate text-[11.5px] text-muted-foreground">Guardian of {student.name} · {student.className}-{student.section}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
              <Phone className="h-3 w-3" /> {student.guardianPhone}
            </div>

            {thread && (
              <p className="truncate rounded-lg bg-muted/50 px-2.5 py-1.5 text-[11.5px] text-muted-foreground">"{thread.preview}"</p>
            )}

            <div className="mt-auto flex gap-2 border-t border-border/60 pt-3">
              <Button
                size="sm"
                variant="outline"
                className="h-8 flex-1 gap-1.5 text-[12px]"
                onClick={() => toast.info(`Opening a message to ${student.guardian} — coming soon`)}
              >
                <MessageSquare className="h-3.5 w-3.5" /> Message
              </Button>
            </div>
          </PremiumCard>
        ))}
      </Reveal>

      {guardians.length === 0 && (
        <PremiumCard className="flex flex-col items-center gap-2 p-10 text-center">
          <Users className="h-8 w-8 text-muted-foreground/60" />
          <p className="text-[13px] font-medium text-foreground">No guardians found</p>
        </PremiumCard>
      )}
    </div>
  );
}
