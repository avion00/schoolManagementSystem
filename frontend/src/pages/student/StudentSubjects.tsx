import { useNavigate } from "react-router-dom";

import { Reveal } from "@/components/motion";
import { StudentSubjectCard } from "@/components/student/StudentSubjectCard";
import { subjects } from "@/data/studentDashboardData";

export function StudentSubjects() {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <Reveal>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">My Subjects</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">{subjects.length} subjects this term</p>
      </Reveal>

      <Reveal delay={60} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((s) => <StudentSubjectCard key={s.id} subject={s} onClick={() => navigate(`/student/subjects/${s.id}`)} />)}
      </Reveal>
    </div>
  );
}
