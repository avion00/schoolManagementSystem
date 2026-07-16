import { ArrowLeft, MessageSquare } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { SlidingTabs } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/PremiumCard";
import {
  exams, homeworkAssignments, learningMaterials, results, subjects, teachers,
} from "@/data/studentDashboardData";
import { useAuth } from "@/lib/auth";
import { messagesService, resolveCurrentChatUser } from "@/lib/messagesService";
import { realtimeService } from "@/lib/realtimeService";

const TABS = [
  { value: "overview", label: "Overview" },
  { value: "materials", label: "Materials" },
  { value: "homework", label: "Homework" },
  { value: "exams", label: "Exams" },
  { value: "results", label: "Results" },
  { value: "syllabus", label: "Syllabus" },
  { value: "teacher", label: "Teacher" },
];

export function StudentSubjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUserId = user ? resolveCurrentChatUser(user).id : "";
  const [tab, setTab] = useState("overview");

  const subject = subjects.find((s) => s.id === id);
  if (!subject) {
    return (
      <PremiumCard className="flex flex-col items-center gap-2 p-10 text-center">
        <p className="text-[13.5px] font-medium text-foreground">Subject not found</p>
        <Button variant="outline" onClick={() => navigate("/student/subjects")}>Back to Subjects</Button>
      </PremiumCard>
    );
  }

  const teacher = teachers.find((t) => t.name === subject.teacher);
  const subjectHomework = homeworkAssignments.filter((h) => h.subject === subject.name);
  const subjectMaterials = learningMaterials.filter((m) => m.subject === subject.name);
  const subjectExams = exams.filter((e) => e.subject === subject.name);
  const pct = Math.round((subject.syllabusCompleted / subject.syllabusTotal) * 100);

  function messageTeacher() {
    if (!teacher || !subject) return;
    const conv = messagesService.findOrCreateDirectConversation({
      currentUserId, otherUserId: teacher.chatUserId, otherUserName: teacher.name, otherUserRole: "Teacher",
      subtitle: `${subject.name} teacher`,
    });
    realtimeService.refreshConversations();
    navigate(`/student/messages/${conv.id}`);
  }

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-2 text-[12.5px]" onClick={() => navigate("/student/subjects")}>
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Subjects
      </Button>

      <PremiumCard className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-[16px] font-semibold text-foreground">{subject.name}</h1>
            <p className="mt-0.5 text-[13px] text-muted-foreground">{subject.teacher} · {subject.weeklyClasses} classes/week</p>
          </div>
          <Button size="sm" variant="outline" className="h-8 gap-1.5 text-[12px]" onClick={messageTeacher}>
            <MessageSquare className="h-3.5 w-3.5" /> Message teacher
          </Button>
        </div>
      </PremiumCard>

      <div className="-mx-1 overflow-x-auto px-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <SlidingTabs value={tab} onValueChange={setTab} options={TABS} className="w-max" />
      </div>

      {tab === "overview" && (
        <PremiumCard className="p-5">
          <div className="mb-3">
            <div className="mb-1 flex items-center justify-between text-[12px] text-muted-foreground">
              <span>Syllabus progress</span>
              <span>{subject.syllabusCompleted}/{subject.syllabusTotal} ({pct}%)</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted/60">
              <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-[12.5px] sm:grid-cols-4">
            <div><p className="text-muted-foreground">Latest marks</p><p className="font-medium text-foreground">{subject.latestMarks}/{subject.latestFullMarks}</p></div>
            <div><p className="text-muted-foreground">Homework pending</p><p className="font-medium text-foreground">{subject.homeworkPending}</p></div>
            <div><p className="text-muted-foreground">Materials</p><p className="font-medium text-foreground">{subject.materialsCount}</p></div>
            <div><p className="text-muted-foreground">Upcoming exams</p><p className="font-medium text-foreground">{subjectExams.filter((e) => e.status === "Upcoming").length}</p></div>
          </div>
        </PremiumCard>
      )}

      {tab === "materials" && (
        <PremiumCard className="p-5">
          {subjectMaterials.length === 0 ? <p className="text-[12.5px] text-muted-foreground">No materials shared yet.</p> : (
            <ul className="space-y-2 text-[13px] text-foreground">
              {subjectMaterials.map((m) => <li key={m.id}>{m.title} <span className="text-muted-foreground">· {m.type}</span></li>)}
            </ul>
          )}
        </PremiumCard>
      )}

      {tab === "homework" && (
        <PremiumCard className="p-5">
          {subjectHomework.length === 0 ? <p className="text-[12.5px] text-muted-foreground">No homework for this subject.</p> : (
            <ul className="space-y-2 text-[13px] text-foreground">
              {subjectHomework.map((h) => (
                <li key={h.id} className="flex items-center justify-between">
                  <button type="button" onClick={() => navigate(`/student/assignments/${h.id}`)} className="hover:underline">{h.title}</button>
                  <span className="text-muted-foreground">{h.status}</span>
                </li>
              ))}
            </ul>
          )}
        </PremiumCard>
      )}

      {tab === "exams" && (
        <PremiumCard className="p-5">
          {subjectExams.length === 0 ? <p className="text-[12.5px] text-muted-foreground">No exams scheduled.</p> : (
            <ul className="space-y-2 text-[13px] text-foreground">
              {subjectExams.map((e) => <li key={e.id}>{e.examType} — {e.date} at {e.time}</li>)}
            </ul>
          )}
        </PremiumCard>
      )}

      {tab === "results" && (
        <PremiumCard className="p-5">
          <ul className="space-y-2 text-[13px] text-foreground">
            {results.map((r) => {
              const s = r.subjects.find((sub) => sub.subject === subject.name);
              if (!s) return null;
              return <li key={r.term}>{r.term}: {s.total}/{s.fullMarks} — Grade {s.grade}</li>;
            })}
          </ul>
        </PremiumCard>
      )}

      {tab === "syllabus" && (
        <PremiumCard className="p-5">
          <ul className="list-disc space-y-1.5 pl-5 text-[13px] text-foreground">
            {subject.syllabusTopics.map((t) => <li key={t}>{t}</li>)}
          </ul>
        </PremiumCard>
      )}

      {tab === "teacher" && teacher && (
        <PremiumCard className="p-5">
          <p className="text-[13.5px] font-medium text-foreground">{teacher.name}</p>
          <p className="mt-0.5 text-[12.5px] text-muted-foreground">{teacher.department} · Office hours: {teacher.officeHours}</p>
          <Button size="sm" variant="outline" className="mt-3 h-8 gap-1.5 text-[12px]" onClick={messageTeacher}>
            <MessageSquare className="h-3.5 w-3.5" /> Message
          </Button>
        </PremiumCard>
      )}
    </div>
  );
}
