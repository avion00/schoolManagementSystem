import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { Reveal } from "@/components/motion";
import { TeacherStudentsTable } from "@/components/teacher/TeacherStudentsTable";
import { PremiumSelect } from "@/components/ui/PremiumSelect";
import { PremiumTableToolbar } from "@/components/ui/PremiumTableToolbar";
import { assignedClasses, assignedStudents } from "@/data/teacherDashboardData";

const PAGE_SIZE = 10;

const CLASS_OPTIONS = [
  { value: "all", label: "All classes" },
  ...assignedClasses.map((c) => ({ value: c.id, label: `${c.className} · ${c.section}` })),
];
const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
  { value: "Transferred", label: "Transferred" },
];

export function TeacherStudents() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState(searchParams.get("class") ?? "all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string | number>>(new Set());

  const hasActiveFilter = !!search || filterClass !== "all" || filterStatus !== "all";

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return assignedStudents.filter((s) => {
      if (q) {
        const hit = s.name.toLowerCase().includes(q) || s.registrationNo.toLowerCase().includes(q) || s.guardian.toLowerCase().includes(q);
        if (!hit) return false;
      }
      if (filterClass !== "all" && s.classId !== filterClass) return false;
      if (filterStatus !== "all" && s.status !== filterStatus) return false;
      return true;
    });
  }, [search, filterClass, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function resetFilters() {
    setSearch("");
    setFilterClass("all");
    setFilterStatus("all");
    setPage(1);
  }

  return (
    <div className="space-y-4">
      <Reveal>
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">My Students</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {filtered.length} student{filtered.length !== 1 ? "s" : ""} across your assigned classes
            {hasActiveFilter && <span> (filtered from {assignedStudents.length})</span>}.
          </p>
        </div>
      </Reveal>

      <Reveal delay={60}>
        <PremiumTableToolbar
          search={search}
          onSearchChange={(v) => { setSearch(v); setPage(1); }}
          searchPlaceholder="Search by name, reg no, guardian…"
          hasActiveFilter={hasActiveFilter}
          onReset={resetFilters}
          filters={
            <>
              <PremiumSelect value={filterClass} onChange={(v) => { setFilterClass(v); setPage(1); }} className="w-44" options={CLASS_OPTIONS} />
              <PremiumSelect value={filterStatus} onChange={(v) => { setFilterStatus(v); setPage(1); }} className="w-40" options={STATUS_OPTIONS} />
            </>
          }
        />
      </Reveal>

      <Reveal delay={100}>
        <TeacherStudentsTable
          rows={paginated}
          selected={selected}
          onSelectionChange={setSelected}
          pagination={{ page: safePage, pageSize: PAGE_SIZE, total: filtered.length, onPage: (p) => { setPage(p); setSelected(new Set()); }, itemLabel: "students" }}
          hasActiveFilter={hasActiveFilter}
          onResetFilters={resetFilters}
          onViewProfile={(s) => navigate(`/teacher/students/${s.id}`)}
          onAddRemark={(s) => toast.success(`Note added for ${s.name} (demo — not saved)`)}
          onMessageGuardian={(s) => toast.info(`Opening a message to ${s.guardian} — coming soon`)}
          onViewAttendance={(s) => navigate(`/teacher/students/${s.id}`)}
          onViewMarks={(s) => navigate(`/teacher/students/${s.id}`)}
        />
      </Reveal>
    </div>
  );
}
