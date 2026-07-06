import { BookOpen, Edit, Printer } from "lucide-react";
import { useNavigate }             from "react-router-dom";
import { Button }                  from "@/components/ui/button";
import { SubjectStatusBadge }      from "@/components/subjects/SubjectStatusBadge";
import { SubjectTypeBadge }        from "@/components/subjects/SubjectTypeBadge";
import type { SubjectData, SubjectCategory } from "@/data/subjectsData";

const CAT_GRAD: Record<SubjectCategory, string> = {
  "Compulsory":      "from-violet-600 via-violet-500 to-indigo-500",
  "Optional":        "from-amber-500 via-orange-400 to-yellow-400",
  "Language":        "from-blue-600 via-blue-500 to-sky-400",
  "Science":         "from-emerald-600 via-teal-500 to-cyan-500",
  "Commerce":        "from-teal-600 via-teal-500 to-green-400",
  "Technical":       "from-indigo-600 via-blue-600 to-blue-500",
  "Extra-curricular":"from-rose-500 via-pink-500 to-fuchsia-500",
};

const CAT_ICON_BG: Record<SubjectCategory, string> = {
  "Compulsory":      "bg-white/20",
  "Optional":        "bg-white/20",
  "Language":        "bg-white/20",
  "Science":         "bg-white/20",
  "Commerce":        "bg-white/20",
  "Technical":       "bg-white/20",
  "Extra-curricular":"bg-white/20",
};

function Chip({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-medium text-white/60 uppercase tracking-wide">{label}</span>
      <span className="text-[13px] font-semibold text-white">{value}</span>
    </div>
  );
}

export function SubjectProfileHero({ sub }: { sub: SubjectData }) {
  const navigate = useNavigate();
  const grad = CAT_GRAD[sub.category];

  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-r ${grad} p-6 text-white shadow-lg`}>
      {/* decorative circles */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-10 -right-4 h-36 w-36 rounded-full bg-white/10" />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        {/* left: icon + identity */}
        <div className="flex items-center gap-4">
          <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl ${CAT_ICON_BG[sub.category]} backdrop-blur-sm`}>
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <div>
            <p className="text-[11px] font-mono font-medium text-white/70">{sub.subjectCode}</p>
            <h1 className="text-xl font-bold leading-tight">{sub.subjectName}</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <SubjectStatusBadge status={sub.status} />
              <SubjectTypeBadge   type={sub.type}     />
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold">
                {sub.category}
              </span>
            </div>
          </div>
        </div>

        {/* right: actions */}
        <div className="flex shrink-0 gap-2">
          <Button size="sm" variant="secondary" className="h-8 gap-1.5 text-[11px]"
            onClick={() => navigate(`/subjects/subject-form/print`)}>
            <Printer className="h-3 w-3" /> Print
          </Button>
          <Button size="sm" variant="secondary" className="h-8 gap-1.5 text-[11px]"
            onClick={() => navigate(`/subjects/${sub.id}/edit`)}>
            <Edit className="h-3 w-3" /> Edit
          </Button>
        </div>
      </div>

      {/* stats row */}
      <div className="relative mt-5 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/20 pt-4">
        <Chip label="Department"     value={sub.department}        />
        <Chip label="Weekly Periods" value={`${sub.weeklyPeriods} periods`} />
        <Chip label="Full Marks"     value={sub.fullMarks}          />
        <Chip label="Credit Hours"   value={sub.creditHours}        />
        <Chip label="Exam Duration"  value={sub.examDuration}       />
        <Chip label="Academic Year"  value={sub.academicYear}       />
      </div>
    </div>
  );
}
