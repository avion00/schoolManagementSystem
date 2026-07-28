import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Download, Plus, Printer } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { ExamScheduleSummaryCards } from "@/components/exams/ExamScheduleSummaryCards";
import { ExamScheduleToolbar, type ScheduleFilters } from "@/components/exams/ExamScheduleToolbar";
import { ExamScheduleTable } from "@/components/exams/ExamScheduleTable";
import { EXAM_SCHEDULES } from "@/data/examsData";

const PAGE_SIZE = 15;
type SortField = "examId" | "term" | "subject" | "className" | "date" | "room" | "invigilator" | "fullMarks" | "status";
type SortDir = "asc" | "desc";

const EMPTY: ScheduleFilters = { search: "", term: "", className: "", section: "", type: "", status: "", year: "" };

export function ExamSchedulePage() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState<ScheduleFilters>(EMPTY);
  const [sortField, setSortField] = useState<SortField>("examId");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string | number>>(new Set());

  const onChange = useCallback((key: keyof ScheduleFilters, value: string) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  }, []);
  const onClear = useCallback(() => { setFilters(EMPTY); setPage(1); }, []);
  function handleSort(field: string) {
    const f = field as SortField;
    if (sortField === f) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(f); setSortDir("asc"); }
    setPage(1);
  }

  const hasActiveFilter =
    !!filters.search || !!filters.term || !!filters.className || !!filters.section ||
    !!filters.type || !!filters.status || !!filters.year;

  const filtered = useMemo(() => {
    const q = filters.search.toLowerCase();
    return EXAM_SCHEDULES.filter((e) => {
      if (filters.term      && e.term      !== filters.term)      return false;
      if (filters.className && e.className !== filters.className)  return false;
      if (filters.section   && e.section   !== filters.section)    return false;
      if (filters.type      && e.examType  !== filters.type)       return false;
      if (filters.status    && e.status    !== filters.status)     return false;
      if (filters.year      && e.academicYear !== filters.year)    return false;
      if (q && !(
        e.examId.toLowerCase().includes(q)   ||
        e.subject.toLowerCase().includes(q)  ||
        e.examName.toLowerCase().includes(q) ||
        e.room.toLowerCase().includes(q)     ||
        e.invigilator.toLowerCase().includes(q)
      )) return false;
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
  const paginated = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="space-y-4">
      {/* Header */}
      <PageHeader
        title={
          <>
            {sorted.length} exam{sorted.length !== 1 ? "s" : ""} scheduled{" "}
            {hasActiveFilter && (
              <span className="text-base font-normal text-muted-foreground">(filtered from {EXAM_SCHEDULES.length} total)</span>
            )}
          </>
        }
        description="Academic Year 2026/27 · Manage exam dates, rooms, and invigilators."
        actions={
          <>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 rounded-xl" onClick={() => window.print()}>
              <Printer className="h-3.5 w-3.5" /> Print
            </Button>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 rounded-xl" onClick={() => toast.info("Export schedule — coming soon")}>
              <Download className="h-3.5 w-3.5" /> Export
            </Button>
            <Button size="sm" className="h-9 gap-1.5 rounded-xl" onClick={() => navigate("/exams/schedule/new")}>
              <Plus className="h-4 w-4" /> Add Exam
            </Button>
          </>
        }
      />

      {/* Summary */}
      <ExamScheduleSummaryCards schedules={EXAM_SCHEDULES} />

      {/* Filters */}
      <ExamScheduleToolbar filters={filters} onChange={onChange} onClear={onClear} hasActiveFilter={hasActiveFilter} />

      {/* Table */}
      <ExamScheduleTable
        rows={paginated}
        sortField={sortField}
        sortDir={sortDir}
        onSort={handleSort}
        selected={selected}
        onSelectionChange={setSelected}
        pagination={{ page: safePage, pageSize: PAGE_SIZE, total: sorted.length, onPage: (p) => { setPage(p); setSelected(new Set()); }, itemLabel: "exams" }}
        hasActiveFilter={hasActiveFilter}
        onResetFilters={onClear}
      />
    </div>
  );
}
