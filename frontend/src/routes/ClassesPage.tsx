import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { ClassesSummaryCards } from "@/components/classes/ClassesSummaryCards";
import { ClassesTable } from "@/components/classes/ClassesTable";
import { ClassesToolbar, type ClassesFilters } from "@/components/classes/ClassesToolbar";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { useClasses } from "@/api/classes";
import { errorMessage } from "@/api/http";
import { PremiumEmptyState } from "@/components/ui/PremiumEmptyState";
import { PremiumSkeleton } from "@/components/ui/PremiumSkeleton";
import { useAuth } from "@/lib/auth";

const PAGE_SIZE = 10;
type SortField = "classId" | "className" | "totalStudents" | "totalCapacity" | "academicYear" | "status";
type SortDir = "asc" | "desc";

const EMPTY_FILTERS: ClassesFilters = {
  search: "", filterYear: "all", filterMedium: "all", filterShift: "all", filterStatus: "all",
};

export function ClassesPage() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState<ClassesFilters>(EMPTY_FILTERS);
  const [sortField, setSortField] = useState<SortField>("classId");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string | number>>(new Set());

  function updateFilters(next: Partial<ClassesFilters>) {
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

  const classesQuery = useClasses();
  const CLASSES = useMemo(() => classesQuery.data ?? [], [classesQuery.data]);
  const { hasPermission } = useAuth();
  const yearOptions = [...new Set(CLASSES.map((c) => c.academicYear).filter(Boolean))];

  const hasActiveFilter =
    !!filters.search || filters.filterYear !== "all" || filters.filterMedium !== "all" ||
    filters.filterShift !== "all" || filters.filterStatus !== "all";

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return CLASSES.filter((c) => {
      if (q && ![c.className, c.classId, c.mainClassTeacher?.name ?? "", c.mainRoom,
        ...c.sections.map((s) => s.sectionName)].some((v) => v.toLowerCase().includes(q))) return false;
      if (filters.filterYear !== "all" && c.academicYear !== filters.filterYear) return false;
      if (filters.filterMedium !== "all" && c.medium !== filters.filterMedium) return false;
      if (filters.filterShift !== "all" && c.shift !== filters.filterShift) return false;
      if (filters.filterStatus !== "all" && c.status !== filters.filterStatus) return false;
      return true;
    });
  }, [filters, CLASSES]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let va: string, vb: string;
      switch (sortField) {
        case "classId": va = a.classId; vb = b.classId; break;
        case "className": va = a.className; vb = b.className; break;
        case "totalStudents": va = String(a.totalStudents); vb = String(b.totalStudents); break;
        case "totalCapacity": va = String(a.totalCapacity); vb = String(b.totalCapacity); break;
        case "academicYear": va = a.academicYear; vb = b.academicYear; break;
        case "status": va = a.status; vb = b.status; break;
        default: va = a.classId; vb = b.classId;
      }
      return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    });
  }, [filtered, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="space-y-4">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <PageHeader
        title={
          <>
            {sorted.length} class{sorted.length !== 1 ? "es" : ""}{" "}
            {hasActiveFilter && (
              <span className="text-base font-normal text-muted-foreground">(filtered from {CLASSES.length} total)</span>
            )}
          </>
        }
        description="Manage classes, sections, teachers, subjects, and student allocation."
        actions={
          hasPermission("academics.manage") ? (
          <Button size="sm" className="h-9 gap-1.5 rounded-xl" onClick={() => navigate("/classes/new")}>
            <Plus className="h-4 w-4" /> Add New Class
          </Button>
          ) : undefined
        }
      />

      {classesQuery.isError && (
        <PremiumEmptyState title="Couldn't load classes" description={errorMessage(classesQuery.error)}
          action={<Button size="sm" variant="outline" onClick={() => classesQuery.refetch()}>Try again</Button>} />
      )}
      {classesQuery.isLoading && <PremiumSkeleton className="h-72 w-full rounded-2xl" />}
      {classesQuery.isSuccess && (<>
      {/* ── Summary ─────────────────────────────────────────────────────── */}
      <ClassesSummaryCards classes={CLASSES} />

      {/* ── Filters ─────────────────────────────────────────────────────── */}
      <ClassesToolbar
        filters={filters}
        onFiltersChange={updateFilters}
        hasActiveFilter={hasActiveFilter}
        onReset={resetFilters}
        yearOptions={yearOptions}
      />

      {/* ── Table ───────────────────────────────────────────────────────── */}
      <ClassesTable
        rows={paginated}
        sortField={sortField}
        sortDir={sortDir}
        onSort={handleSort}
        selected={selected}
        onSelectionChange={setSelected}
        pagination={{ page: safePage, pageSize: PAGE_SIZE, total: sorted.length, onPage: (p) => { setPage(p); setSelected(new Set()); }, itemLabel: "classes" }}
        hasActiveFilter={hasActiveFilter}
        onResetFilters={resetFilters}
      />
      </>)}
    </div>
  );
}
