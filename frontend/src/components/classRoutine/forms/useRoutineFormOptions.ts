import { useRooms, useTeacherOptions } from "@/api/routine";
import { useAcademicOptions } from "@/api/students";
import { useSubjects } from "@/api/teachers";

/** Select options for the routine form, all from the API. */
export function useRoomsAndOptions() {
  const academics = useAcademicOptions();
  const subjects = useSubjects();
  const teachers = useTeacherOptions();
  const rooms = useRooms();
  const year = academics.data?.years.find((y) => y.isCurrent) ?? academics.data?.years[0];
  return {
    yearId: year?.id,
    sections: (academics.data?.sections ?? []).map((s) => ({ value: s.id, label: `${s.className} – ${s.name}` })),
    subjects: (subjects.data ?? []).map((s) => ({ value: s.id, label: s.name })),
    teachers: (teachers.data ?? []).map((t) => ({ value: t.id, label: t.name })),
    rooms: (rooms.data ?? []).map((r) => ({ value: r.id, label: r.name })),
  };
}
