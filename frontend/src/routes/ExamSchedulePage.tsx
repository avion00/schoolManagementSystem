import { useState, useMemo, useCallback } from "react";
import type { ExamSchedule } from "@/api/types/exams";
import { useNavigate } from "react-router-dom";
import { Download, Plus, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { ExamScheduleSummaryCards } from "@/components/exams/ExamScheduleSummaryCards";
import { ExamScheduleToolbar, type ScheduleFilters } from "@/components/exams/ExamScheduleToolbar";
import { ExamScheduleTable } from "@/components/exams/ExamScheduleTable";
import { useExamSchedule } from "@/api/exams";
import { errorMessage } from "@/api/http";
import { PremiumEmptyState } from "@/components/ui/PremiumEmptyState";
import { PremiumSkeleton } from "@/components/ui/PremiumSkeleton";
import { useAuth } from "@/lib/auth";

const PAGE_SIZE = 15;
type SortField = "examId" | "term" | "subject" | "className" | "date" | "room" | "invigilator" | "fullMarks" | "status";
type SortDir = "asc" | "desc";

const EMPTY: ScheduleFilters = { search: "", term: "", className: "", type: "", status: "", year: "" };

function exportCsv(rows: ExamSchedule[]) {
  const head = ["Exam ID", "Exam", "Term", "Type", "Subject", "Class", "Date", "Start", "End", "Room", "Invigilator", "Assistant", "Full", "Pass", "Status"];
  const body = rows.map((e) => [e.examId, e.examName, e.term, e.examType, e.subject, e.className, e.date, e.startTime, e.endTime,
    e.room, e.invigilator, e.assistantInvigilator, e.fullMarks, e.passMarks, e.status]);
  const csv = [head, ...body].map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: "exam-schedule.csv" });
  a.click();
  URL.revokeObjectURL(url);
}

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

  const query = useExamSchedule();
  const { hasPermission } = useAuth();
  const canManage = hasPermission("exam.create");
  const EXAM_SCHEDULES = useMemo(() => query.data?.schedule ?? [], [query.data]);
  const conflictIds = useMemo(() => new Set((query.data?.clashes ?? []).map((c) => c.paperId)), [query.data]);
  const options = useMemo(() => ({
    terms: [...new Set(EXAM_SCHEDULES.map((e) => e.term).filter(Boolean))].sort(),
    classes: [...new Set(EXAM_SCHEDULES.map((e) => e.className))],
    years: [...new Set(EXAM_SCHEDULES.map((e) => e.academicYear).filter(Boolean))],
  }), [EXAM_SCHEDULES]);

  const hasActiveFilter =
    !!filters.search || !!filters.term || !!filters.className ||
    !!filters.type || !!filters.status || !!filters.year;

  const filtered = useMemo(() => {
    const q = filters.search.toLowerCase();
    return EXAM_SCHEDULES.filter((e) => {
      if (filters.term      && e.term      !== filters.term)      return false;
      if (filters.className && e.className !== filters.className)  return false;
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
  }, [filters, EXAM_SCHEDULES]);

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
            {sorted.length} paper{sorted.length !== 1 ? "s" : ""} scheduled{" "}
            {hasActiveFilter && (
              <span className="text-base font-normal text-muted-foreground">(filtered from {EXAM_SCHEDULES.length} total)</span>
            )}
          </>
        }
        description={`${options.years.join(", ") || "All years"} · Manage exam dates, rooms, and invigilators.`}
        actions={
          <>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 rounded-xl" onClick={() => window.print()}>
              <Printer className="h-3.5 w-3.5" /> Print
            </Button>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 rounded-xl" onClick={() => exportCsv(sorted)} disabled={sorted.length === 0}>
              <Download className="h-3.5 w-3.5" /> Export
            </Button>
            {canManage && (
            <Button size="sm" className="h-9 gap-1.5 rounded-xl" onClick={() => navigate("/exams/schedule/new")}>
              <Plus className="h-4 w-4" /> Add Paper
            </Button>
            )}
          </>
        }
      />

      {query.isError && (
        <PremiumEmptyState title="Couldn't load the exam schedule" description={errorMessage(query.error)}
          action={<Button size="sm" variant="outline" onClick={() => query.refetch()}>Try again</Button>} />
      )}
      {query.isLoading && <PremiumSkeleton className="h-72 w-full rounded-2xl" />}
      {query.isSuccess && (<>
      {/* Summary */}
      <ExamScheduleSummaryCards schedules={EXAM_SCHEDULES} conflicts={conflictIds.size} />

      {/* Filters */}
      <ExamScheduleToolbar filters={filters} onChange={onChange} onClear={onClear} hasActiveFilter={hasActiveFilter} options={options} />

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
        conflictIds={conflictIds}
        canManage={canManage}
      />
      </>)}
    </div>
  );
}
