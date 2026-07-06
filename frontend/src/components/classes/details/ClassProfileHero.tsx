import { ArrowLeft, BookOpen, Download, Pencil, Printer, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { ClassStatusBadge } from "@/components/classes/ClassStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ClassData } from "@/data/classesData";

const GRADE_COLORS = [
  "from-violet-600 to-violet-800",
  "from-blue-600 to-blue-800",
  "from-emerald-600 to-emerald-800",
  "from-amber-600 to-amber-800",
  "from-rose-600 to-rose-800",
  "from-indigo-600 to-indigo-800",
  "from-teal-600 to-teal-800",
  "from-orange-600 to-orange-800",
  "from-sky-600 to-sky-800",
  "from-pink-600 to-pink-800",
  "from-lime-600 to-lime-800",
  "from-cyan-600 to-cyan-800",
];

export function ClassProfileHero({ cls }: { cls: ClassData }) {
  const navigate = useNavigate();
  const grad = GRADE_COLORS[(cls.gradeLevel - 1) % GRADE_COLORS.length];

  const stats = [
    { label: "Sections",     value: cls.sections.length },
    { label: "Students",     value: cls.totalStudents },
    { label: "Capacity",     value: cls.totalCapacity },
    { label: "Subjects",     value: cls.subjects.length },
  ];

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${grad} p-6 text-white shadow-md`}>
      {/* Decorative circles */}
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5" />
      <div className="absolute -bottom-8 -right-4 h-28 w-28 rounded-full bg-white/5" />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        {/* Left: class info */}
        <div className="flex gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-2xl font-black">
            {cls.gradeLevel}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold">{cls.className}</h1>
              <ClassStatusBadge status={cls.status} />
            </div>
            <p className="mt-0.5 text-[13px] text-white/75">{cls.classId} · AY {cls.academicYear}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-[12px]">
              <Badge className="bg-white/20 text-white hover:bg-white/30 border-0">
                <BookOpen className="mr-1 h-3 w-3" />{cls.medium}
              </Badge>
              <Badge className="bg-white/20 text-white hover:bg-white/30 border-0">{cls.shift}</Badge>
              <Badge className="bg-white/20 text-white hover:bg-white/30 border-0">{cls.building}</Badge>
              <Badge className="bg-white/20 text-white hover:bg-white/30 border-0">{cls.mainRoom}</Badge>
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-[12.5px] text-white/80">
              <Users className="h-3.5 w-3.5" />
              Class Teacher: <span className="font-semibold">{cls.mainClassTeacher.name}</span>
              <span className="text-white/50">·</span>
              <span className="text-white/60">{cls.mainClassTeacher.employeeId}</span>
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-end">
          <Button size="sm" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20"
            onClick={() => navigate("/classes")}>
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />Back
          </Button>
          <Button size="sm" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20"
            onClick={() => navigate(`/classes/${cls.id}/edit`)}>
            <Pencil className="mr-1.5 h-3.5 w-3.5" />Edit
          </Button>
          <Button size="sm" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20"
            onClick={() => navigate("/classes/class-form/print")}>
            <Printer className="mr-1.5 h-3.5 w-3.5" />Print
          </Button>
          <Button size="sm" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
            <Download className="mr-1.5 h-3.5 w-3.5" />Export
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="relative mt-5 grid grid-cols-4 divide-x divide-white/20 rounded-xl bg-white/10 px-2">
        {stats.map(({ label, value }) => (
          <div key={label} className="px-4 py-3 text-center">
            <p className="text-xl font-bold">{value}</p>
            <p className="text-[11px] text-white/70">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
