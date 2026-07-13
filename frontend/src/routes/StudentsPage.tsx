import { useMemo, useState } from "react";
import { Download, Plus, Upload } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { Reveal } from "@/components/motion";
import { StudentCardGrid } from "@/components/students/StudentCardGrid";
import { StudentsSummaryCards } from "@/components/students/StudentsSummaryCards";
import { StudentsTable } from "@/components/students/StudentsTable";
import { StudentsToolbar, type StudentsFilters } from "@/components/students/StudentsToolbar";
import { Button } from "@/components/ui/button";
import { PremiumTabs } from "@/components/ui/PremiumTabs";
import { STUDENTS, type Student, type StudentStatus } from "@/data/studentsData";
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
  }, [filters]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av: string | number = a[sortField] ?? "";
      const bv: string | number = b[sortField] ?? "";
      if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av;
      return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
  }, [filtered, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated: Student[] = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="space-y-4">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <Reveal className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">
            {sorted.length} student{sorted.length !== 1 ? "s" : ""}{" "}
            {hasActiveFilter && <span className="text-muted-foreground">(filtered from {STUDENTS.length} total)</span>}
          </p>
          <p className="text-xs text-muted-foreground">Manage enrolled students and their academic records.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PremiumTabs
            value={view}
            onValueChange={(v) => setView(v as ViewMode)}
            options={[{ value: "table", label: "Table" }, { value: "card", label: "Cards" }]}
          />
          <Button variant="outline" size="sm" className="h-9 gap-1.5 rounded-xl" onClick={() => toast.info("Import students — coming soon")}>
            <Upload className="h-3.5 w-3.5" /> Import
          </Button>
          <Button variant="outline" size="sm" className="h-9 gap-1.5 rounded-xl" onClick={() => toast.info("Export students — coming soon")}>
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
          {canCreate && (
            <Button size="sm" className="h-9 gap-1.5 rounded-xl" onClick={() => navigate("/students/new")}>
              <Plus className="h-4 w-4" /> New student
            </Button>
          )}
        </div>
      </Reveal>

      {/* ── Summary ─────────────────────────────────────────────────────── */}
      <StudentsSummaryCards students={STUDENTS} />

      {/* ── Filters ─────────────────────────────────────────────────────── */}
      <StudentsToolbar
        filters={filters}
        onFiltersChange={updateFilters}
        hasActiveFilter={hasActiveFilter}
        onReset={resetFilters}
        showColumnsMenu={view === "table"}
        hiddenColumns={hiddenColumns}
        onToggleColumn={toggleColumn}
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
    </div>
  );
}
