import { Shell } from "@/components/Shell";
import { teacherSidebar } from "@/config/sidebarConfig";

export function TeacherLayout() {
  return <Shell nav={teacherSidebar} brand="Teacher Portal" />;
}
