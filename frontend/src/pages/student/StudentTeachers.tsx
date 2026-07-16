import { Reveal } from "@/components/motion";
import { StudentTeacherCard } from "@/components/student/StudentTeacherCard";
import { teachers } from "@/data/studentDashboardData";
import { useAuth } from "@/lib/auth";
import { resolveCurrentChatUser } from "@/lib/messagesService";

export function StudentTeachers() {
  const { user } = useAuth();
  const currentUserId = user ? resolveCurrentChatUser(user).id : "";

  return (
    <div className="space-y-4">
      <Reveal>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">My Teachers</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">{teachers.length} teachers assigned to your class</p>
      </Reveal>

      <Reveal delay={60} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {teachers.map((t) => <StudentTeacherCard key={t.id} teacher={t} currentUserId={currentUserId} />)}
      </Reveal>
    </div>
  );
}
