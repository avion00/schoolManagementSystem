import { Reveal } from "@/components/motion";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { PremiumCard } from "@/components/ui/PremiumCard";
import type { Student } from "@/data/studentsData";

export function StudentsSummaryCards({ students }: { students: Student[] }) {
  const stats = [
    { label: "Total Students", value: students.length },
    { label: "Active", value: students.filter((s) => s.status === "active").length },
    { label: "Graduated", value: students.filter((s) => s.status === "graduated").length },
    { label: "Inactive / Transferred", value: students.filter((s) => s.status === "inactive" || s.status === "transferred").length },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s, i) => (
        <Reveal key={s.label} delay={i * 40}>
          <PremiumCard hoverable className="p-4">
            <p className="text-[11px] text-muted-foreground">{s.label}</p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-foreground">
              <AnimatedNumber value={s.value} />
            </p>
          </PremiumCard>
        </Reveal>
      ))}
    </div>
  );
}
