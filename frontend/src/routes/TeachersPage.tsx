import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { TeacherAlertsCard } from "@/components/teachers/TeacherAlertsCard";
import { TeachersByDepartmentCard } from "@/components/teachers/TeachersByDepartmentCard";
import { TeachersOverviewDonut } from "@/components/teachers/TeachersOverviewDonut";
import { TeachersSummaryCards } from "@/components/teachers/TeachersSummaryCards";
import { TeachersTable } from "@/components/teachers/TeachersTable";
import { TeachersToolbar, type TeachersFilters } from "@/components/teachers/TeachersToolbar";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { TEACHERS, type Teacher } from "@/data/teachersData";

const PAGE_SIZE = 10;
type SortField = "employeeId" | "name" | "subject" | "department" | "status";
type SortDir = "asc" | "desc";

const EMPTY_FILTERS: TeachersFilters = {
  search: "", filterDept: "all", filterSubject: "all", filterStatus: "all", filterGender: "all", filterEmpType: "all",
};

export function TeachersPage() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState<TeachersFilters>(EMPTY_FILTERS);
  const [sortField, setSortField] = useState<SortField>("employeeId");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string | number>>(new Set());

  function updateFilters(next: Partial<TeachersFilters>) {
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

  const hasActiveFilter =
    !!filters.search || filters.filterDept !== "all" || filters.filterSubject !== "all" ||
    filters.filterStatus !== "all" || filters.filterGender !== "all" || filters.filterEmpType !== "all";

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return TEACHERS.filter((t) => {
      if (q && ![t.name, t.employeeId, t.staffCode, t.email, t.phone, t.subject, t.department]
        .some((v) => v.toLowerCase().includes(q))) return false;
      if (filters.filterDept !== "all" && t.department !== filters.filterDept) return false;
      if (filters.filterSubject !== "all" && t.subject !== filters.filterSubject) return false;
      if (filters.filterStatus !== "all" && t.status !== filters.filterStatus) return false;
      if (filters.filterGender !== "all" && t.gender !== filters.filterGender) return false;
      if (filters.filterEmpType !== "all" && t.employmentType !== filters.filterEmpType) return false;
      return true;
    });
  }, [filters]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let va: string, vb: string;
      switch (sortField) {
        case "employeeId": va = a.employeeId; vb = b.employeeId; break;
        case "name":       va = a.name;       vb = b.name;       break;
        case "subject":    va = a.subject;    vb = b.subject;    break;
        case "department": va = a.department; vb = b.department; break;
        case "status":     va = a.status;     vb = b.status;     break;
      }
      return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    });
  }, [filtered, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated: Teacher[] = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="space-y-4">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <PageHeader
        title={
          <>
            {sorted.length} teacher{sorted.length !== 1 ? "s" : ""}{" "}
            {hasActiveFilter && (
              <span className="text-base font-normal text-muted-foreground">(filtered from {TEACHERS.length} total)</span>
            )}
          </>
        }
        description="Manage teaching staff, subjects and class assignments."
        actions={
          <Button size="sm" className="h-9 gap-1.5 rounded-xl" onClick={() => navigate("/teachers/new")}>
            <Plus className="h-4 w-4" /> Add Teacher
          </Button>
        }
      />

      {/* ── Summary ─────────────────────────────────────────────────────── */}
      <TeachersSummaryCards teachers={TEACHERS} />

      {/* ── Overview: department breakdown + alerts ────────────────────── */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <TeachersOverviewDonut teachers={TEACHERS} />
        </div>
        <div className="lg:col-span-4">
          <TeachersByDepartmentCard teachers={TEACHERS} />
        </div>
        <div className="lg:col-span-3">
          <TeacherAlertsCard teachers={TEACHERS} />
        </div>
      </div>

      {/* ── Filters ─────────────────────────────────────────────────────── */}
      <TeachersToolbar
        filters={filters}
        onFiltersChange={updateFilters}
        hasActiveFilter={hasActiveFilter}
        onReset={resetFilters}
      />

      {/* ── Table ───────────────────────────────────────────────────────── */}
      <TeachersTable
        rows={paginated}
        sortField={sortField}
        sortDir={sortDir}
        onSort={handleSort}
        selected={selected}
        onSelectionChange={setSelected}
        pagination={{ page: safePage, pageSize: PAGE_SIZE, total: sorted.length, onPage: (p) => { setPage(p); setSelected(new Set()); }, itemLabel: "teachers" }}
        hasActiveFilter={hasActiveFilter}
        onResetFilters={resetFilters}
      />
    </div>
  );
}
