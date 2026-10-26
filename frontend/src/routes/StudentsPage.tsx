import { useMemo, useState } from "react";
import { Download, Plus, Upload } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { StudentAlertsCard } from "@/components/students/StudentAlertsCard";
import { StudentCardGrid } from "@/components/students/StudentCardGrid";
import { StudentsByClassCard } from "@/components/students/StudentsByClassCard";
import { StudentsOverviewDonut } from "@/components/students/StudentsOverviewDonut";
import { StudentsSummaryCards } from "@/components/students/StudentsSummaryCards";
import { StudentsTable } from "@/components/students/StudentsTable";
import { StudentsToolbar, type StudentsFilters } from "@/components/students/StudentsToolbar";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { PremiumTabs } from "@/components/ui/PremiumTabs";
import { errorMessage } from "@/api/http";
import { exportStudentsCsv, useAcademicOptions, useStudents } from "@/api/students";
import type { Student, StudentStatus } from "@/api/types/students";
import { PremiumEmptyState } from "@/components/ui/PremiumEmptyState";
import { PremiumSkeleton } from "@/components/ui/PremiumSkeleton";
import { useAuth } from "@/lib/auth";

const PAGE_SIZE = 10;
type SortField = "registrationNo" | "name" | "className" | "roll" | "status";
type SortDir = "asc" | "desc";
type ViewMode = "table" | "card";

const EMPTY_FILTERS: StudentsFilters = {
  search: "", filterClass: "all", filterSection: "all", filterStatus: "all", filterGender: "all",
};

export function StudentsPage() {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const canCreate = hasPermission("student.create");
  const canExport = hasPermission("student.export");
  const studentsQuery = useStudents();
  const options = useAcademicOptions();
  const STUDENTS = useMemo(() => studentsQuery.data ?? [], [studentsQuery.data]);

  const [view, setView] = useState<ViewMode>("table");
  const [filters, setFilters] = useState<StudentsFilters>(EMPTY_FILTERS);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string | number>>(new Set());

  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set(["section"]));

  function updateFilters(next: Partial<StudentsFilters>) {
    setFilters((f) => ({ ...f, ...next }));
    setPage(1);
  }
  function resetFilters() {
    setFilters(EMPTY_FILTERS);
    setPage(1);
  }
  function handleSort(field: string) {
    const f = field as SortField;
    if (sortField === f) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(f); setSortDir("asc"); }
    setPage(1);
  }
  function toggleColumn(key: string) {
    setHiddenColumns((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  const hasActiveFilter =
    !!filters.search || filters.filterClass !== "all" || filters.filterSection !== "all" ||
    filters.filterStatus !== "all" || filters.filterGender !== "all";

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return STUDENTS.filter((s) => {
      if (q) {
        const hit = s.name.toLowerCase().includes(q) || s.admissionNo.toLowerCase().includes(q) ||
          s.registrationNo.toLowerCase().includes(q) || s.parentName.toLowerCase().includes(q);
        if (!hit) return false;
      }
      if (filters.filterClass !== "all" && s.className !== filters.filterClass) return false;
      if (filters.filterSection !== "all" && (s.section ?? "—") !== filters.filterSection) return false;
      if (filters.filterStatus !== "all" && s.status !== (filters.filterStatus as StudentStatus)) return false;
      if (filters.filterGender !== "all" && s.gender !== filters.filterGender) return false;
      return true;
    });
  }, [filters, STUDENTS]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av: string | number = a[sortField] ?? "";
      const bv: string | number = b[sortField] ?? "";
      if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av;
      return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
  }, [filtered, sortField, sortDir]);

  const classOptions = (options.data?.classes ?? []).map((c) => c.name);
  const sectionOptions = [...new Set(
    (options.data?.sections ?? [])
      .filter((sec) => filters.filterClass === "all" || sec.className === filters.filterClass)
      .map((sec) => sec.name),
  )].sort();

  async function handleExport() {
    const classId = options.data?.classes.find((c) => c.name === filters.filterClass)?.id;
    try {
      await exportStudentsCsv({
        ...(filters.search ? { search: filters.search } : {}),
        ...(classId ? { class_level: classId } : {}),
        ...(filters.filterStatus !== "all" ? { status: filters.filterStatus } : {}),
        ...(filters.filterGender !== "all" ? { gender: filters.filterGender.toLowerCase() } : {}),
      });
    } catch (e) {
      toast.error(errorMessage(e, "Export failed."));
    }
  }

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated: Student[] = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="space-y-4">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <PageHeader
        title={
          <>
            {sorted.length} student{sorted.length !== 1 ? "s" : ""}{" "}
            {hasActiveFilter && (
              <span className="text-base font-normal text-muted-foreground">(filtered from {STUDENTS.length} total)</span>
            )}
          </>
        }
        description="Manage enrolled students and their academic records."
        actions={
          <>
            <PremiumTabs
              value={view}
              onValueChange={(v) => setView(v as ViewMode)}
              options={[{ value: "table", label: "Table" }, { value: "card", label: "Cards" }]}
            />
            <Button variant="outline" size="sm" className="h-9 gap-1.5 rounded-xl" onClick={() => toast.info("Import students — coming soon")}>
              <Upload className="h-3.5 w-3.5" /> Import
            </Button>
            {canExport && (
              <Button variant="outline" size="sm" className="h-9 gap-1.5 rounded-xl" onClick={handleExport}>
                <Download className="h-3.5 w-3.5" /> Export
              </Button>
            )}
            {canCreate && (
              <Button size="sm" className="h-9 gap-1.5 rounded-xl" onClick={() => navigate("/students/new")}>
                <Plus className="h-4 w-4" /> New student
              </Button>
            )}
          </>
        }
      />

      {studentsQuery.isError && (
        <PremiumEmptyState
          title="Couldn't load students"
          description={errorMessage(studentsQuery.error)}
          action={<Button size="sm" variant="outline" onClick={() => studentsQuery.refetch()}>Try again</Button>}
        />
      )}
      {studentsQuery.isLoading && (
        <div className="space-y-3">
          <PremiumSkeleton className="h-24 w-full rounded-2xl" />
          <PremiumSkeleton className="h-64 w-full rounded-2xl" />
        </div>
      )}
      {studentsQuery.isSuccess && (<>
      {/* ── Summary ─────────────────────────────────────────────────────── */}
      <StudentsSummaryCards students={STUDENTS} />

      {/* ── Overview: class breakdown + alerts ─────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <StudentsOverviewDonut students={STUDENTS} />
        </div>
        <div className="lg:col-span-4">
          <StudentsByClassCard students={STUDENTS} />
        </div>
        <div className="lg:col-span-3">
          <StudentAlertsCard students={STUDENTS} />
        </div>
      </div>

      {/* ── Filters ─────────────────────────────────────────────────────── */}
      <StudentsToolbar
        filters={filters}
        onFiltersChange={updateFilters}
        hasActiveFilter={hasActiveFilter}
        onReset={resetFilters}
        showColumnsMenu={view === "table"}
        hiddenColumns={hiddenColumns}
        onToggleColumn={toggleColumn}
        classOptions={classOptions}
        sectionOptions={sectionOptions}
      />

      {/* ── Table / Card view ───────────────────────────────────────────── */}
      {view === "table" ? (
        <StudentsTable
          rows={paginated}
          hiddenColumns={hiddenColumns}
          sortField={sortField}
          sortDir={sortDir}
          onSort={handleSort}
          selected={selected}
          onSelectionChange={setSelected}
          pagination={{ page: safePage, pageSize: PAGE_SIZE, total: sorted.length, onPage: (p) => { setPage(p); setSelected(new Set()); }, itemLabel: "students" }}
          hasActiveFilter={hasActiveFilter}
          onResetFilters={resetFilters}
        />
      ) : (
        <StudentCardGrid students={paginated} hasActiveFilter={hasActiveFilter} onResetFilters={resetFilters} />
      )}
      </>)}
    </div>
  );
}
