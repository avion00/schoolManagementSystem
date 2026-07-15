import { useMemo, useState } from "react";
import { MessageSquare, Phone, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Reveal } from "@/components/motion";
import { StudentAvatar } from "@/components/students/StudentAvatar";
import { ParentMessageTemplate } from "@/components/teacher/ParentMessageTemplate";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { PremiumBadge, type PremiumBadgeTone } from "@/components/ui/PremiumBadge";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { PremiumSearchInput } from "@/components/ui/PremiumSearchInput";
import { PremiumSelect } from "@/components/ui/PremiumSelect";
import {
  assignedStudents,
  meetingRequests,
  parentMessages,
  weakStudents,
  type AssignedStudent,
  type MeetingRequest,
} from "@/data/teacherDashboardData";
import { useAuth } from "@/lib/auth";
import { messagesService, resolveCurrentChatUser } from "@/lib/messagesService";
import { realtimeService } from "@/lib/realtimeService";

const STATUS_TONE: Record<MeetingRequest["status"], PremiumBadgeTone> = {
  Requested: "warning",
  Scheduled: "info",
  Completed: "success",
  Cancelled: "neutral",
};

/** The 3 guardians pre-seeded in messagesData.ts get their real chat identity;
 *  every other guardian gets a stable, deterministic one created on first contact. */
const KNOWN_GUARDIAN_CHAT_IDS: Record<number, string> = {
  1: "u-parent-david-khan",
  2: "u-parent-ravi-sharma",
  3: "u-parent-michael-brown",
};
function guardianChatUserId(studentId: number) {
  return KNOWN_GUARDIAN_CHAT_IDS[studentId] ?? `u-parent-guardian-${studentId}`;
}

export function TeacherParentCommunication() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUserId = user ? resolveCurrentChatUser(user).id : "";

  const [templateOpen, setTemplateOpen] = useState(false);
  const [templateText, setTemplateText] = useState("");
  const [templateStudentId, setTemplateStudentId] = useState<number>(assignedStudents[0]?.id ?? 0);

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

  function messageGuardian(student: AssignedStudent) {
    const conv = messagesService.findOrCreateDirectConversation({
      currentUserId,
      otherUserId: guardianChatUserId(student.id),
      otherUserName: student.guardian,
      otherUserRole: "Parent",
      subtitle: `Guardian of ${student.name} · ${student.className}-${student.section}`,
      relatedStudentId: String(student.id),
      relatedClassId: student.classId,
    });
    realtimeService.refreshConversations();
    navigate(`/teacher/messages/${conv.id}`);
  }

  function openTemplate(rawText: string) {
    setTemplateText(rawText);
    setTemplateOpen(true);
  }

  function sendTemplate() {
    const student = assignedStudents.find((s) => s.id === templateStudentId);
    if (!student) return;
    const conv = messagesService.findOrCreateDirectConversation({
      currentUserId,
      otherUserId: guardianChatUserId(student.id),
      otherUserName: student.guardian,
      otherUserRole: "Parent",
      subtitle: `Guardian of ${student.name} · ${student.className}-${student.section}`,
      relatedStudentId: String(student.id),
      relatedClassId: student.classId,
    });
    const body = templateText.replace(/\{student\}/g, student.name);
    messagesService.sendMessage({ conversationId: conv.id, senderId: currentUserId, body });
    realtimeService.refreshConversations();
    setTemplateOpen(false);
    toast.success(`Message sent to ${student.guardian}`);
    navigate(`/teacher/messages/${conv.id}`);
  }

  const previewText = templateText.replace(/\{student\}/g, assignedStudents.find((s) => s.id === templateStudentId)?.name ?? "the student");

  return (
    <div className="space-y-4">
      <Reveal>
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Parent Communication</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Quickly message and follow up with guardians of your assigned students.</p>
        </div>
      </Reveal>

      <Reveal delay={40}>
        <ParentMessageTemplate onSelect={openTemplate} />
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
                onClick={() => messageGuardian(student)}
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

      <Dialog open={templateOpen} onOpenChange={setTemplateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send a quick message</DialogTitle>
            <DialogDescription>Choose a student, then review the message before sending.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-foreground">Student</label>
              <PremiumSelect
                value={String(templateStudentId)}
                onChange={(v) => setTemplateStudentId(Number(v))}
                options={assignedStudents.map((s) => ({ value: String(s.id), label: `${s.name} — ${s.guardian} (${s.className}-${s.section})` }))}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-foreground">Message</label>
              <textarea
                value={previewText}
                onChange={(e) => setTemplateText(e.target.value)}
                rows={4}
                className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTemplateOpen(false)}>Cancel</Button>
            <Button onClick={sendTemplate}>Send message</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
