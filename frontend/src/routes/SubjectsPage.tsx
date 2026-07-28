import { useMemo, useState } from "react";
import { BookOpen, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { SubjectsSummaryCards } from "@/components/subjects/SubjectsSummaryCards";
import { SubjectsTable } from "@/components/subjects/SubjectsTable";
import { SubjectsToolbar, type SubjectsFilters } from "@/components/subjects/SubjectsToolbar";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { SUBJECTS, type SubjectCategory, type SubjectData, type SubjectStatus, type SubjectType } from "@/data/subjectsData";

const PAGE_SIZE = 10;
type SortField = "subjectName" | "subjectCode" | "category" | "type" | "weeklyPeriods" | "fullMarks" | "status";
type SortDir = "asc" | "desc";

const EMPTY_FILTERS: SubjectsFilters = {
  search: "", filterType: "", filterCategory: "", filterStatus: "", filterYear: "",
};

export function SubjectsPage() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState<SubjectsFilters>(EMPTY_FILTERS);
  const [sortField, setSortField] = useState<SortField>("subjectName");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string | number>>(new Set());

  function updateFilters(next: Partial<SubjectsFilters>) {
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
    !!filters.search || !!filters.filterType || !!filters.filterCategory ||
    !!filters.filterStatus || !!filters.filterYear;

  const filtered = useMemo(() => {
    const q = filters.search.toLowerCase();
    return SUBJECTS.filter((s) => {
      if (q && !s.subjectName.toLowerCase().includes(q) && !s.subjectCode.toLowerCase().includes(q)) return false;
      if (filters.filterType && s.type !== (filters.filterType as SubjectType)) return false;
      if (filters.filterCategory && s.category !== (filters.filterCategory as SubjectCategory)) return false;
      if (filters.filterStatus && s.status !== (filters.filterStatus as SubjectStatus)) return false;
      if (filters.filterYear && s.academicYear !== filters.filterYear) return false;
      return true;
    });
  }, [filters]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = a[sortField as keyof SubjectData];
      const bv = b[sortField as keyof SubjectData];
      if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av;
      return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
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
            {sorted.length} subject{sorted.length !== 1 ? "s" : ""}{" "}
            {hasActiveFilter && (
              <span className="text-base font-normal text-muted-foreground">(filtered from {SUBJECTS.length} total)</span>
            )}
          </>
        }
        description="Manage curriculum subjects, mark structures, and class assignments."
        actions={
          <>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 rounded-xl" onClick={() => navigate("/subjects/subject-form/print")}>
              <BookOpen className="h-3.5 w-3.5" /> Print Form
            </Button>
            <Button size="sm" className="h-9 gap-1.5 rounded-xl" onClick={() => navigate("/subjects/new")}>
              <Plus className="h-4 w-4" /> Add Subject
            </Button>
          </>
        }
      />

      {/* ── Summary ─────────────────────────────────────────────────────── */}
      <SubjectsSummaryCards />

      {/* ── Filters ─────────────────────────────────────────────────────── */}
      <SubjectsToolbar
        filters={filters}
        onFiltersChange={updateFilters}
        hasActiveFilter={hasActiveFilter}
        onReset={resetFilters}
      />

      {/* ── Table ───────────────────────────────────────────────────────── */}
      <SubjectsTable
        rows={paginated}
        sortField={sortField}
        sortDir={sortDir}
        onSort={handleSort}
        selected={selected}
        onSelectionChange={setSelected}
        pagination={{ page: safePage, pageSize: PAGE_SIZE, total: sorted.length, onPage: (p) => { setPage(p); setSelected(new Set()); }, itemLabel: "subjects" }}
        hasActiveFilter={hasActiveFilter}
        onResetFilters={resetFilters}
      />
    </div>
  );
}
