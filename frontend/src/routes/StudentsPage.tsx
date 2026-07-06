import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsUpDown,
  Eye,
  FilterX,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { StudentAvatar } from "@/components/students/StudentAvatar";
import { StudentStatusBadge } from "@/components/students/StudentStatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CLASS_OPTIONS,
  SECTION_OPTIONS,
  STATUS_OPTIONS,
  STUDENTS,
  type Student,
  type StudentStatus,
} from "@/data/studentsData";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

/* ── Constants ───────────────────────────────────────────────────────────── */

const PAGE_SIZE = 10;

type SortField = "registrationNo" | "name" | "className" | "roll" | "status";
type SortDir   = "asc" | "desc";

/* ── Filter select ───────────────────────────────────────────────────────── */

const selectCls =
  "h-9 rounded-md border border-input bg-background px-3 py-0 text-sm text-foreground " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
  "disabled:cursor-not-allowed disabled:opacity-50";

/* ── Sort header button ──────────────────────────────────────────────────── */

function SortTh({
  label,
  field,
  current,
  dir,
  onSort,
  className,
}: {
  label: string;
  field: SortField;
  current: SortField;
  dir: SortDir;
  onSort: (f: SortField) => void;
  className?: string;
}) {
  const active = current === field;
  const Icon = active ? (dir === "asc" ? ChevronUp : ChevronDown) : ChevronsUpDown;
  return (
    <TableHead
      className={cn("select-none", className)}
      onClick={() => onSort(field)}
    >
      <button
        type="button"
        className={cn(
          "flex items-center gap-1 text-left text-xs font-semibold uppercase tracking-wide transition-colors",
          active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
        )}
      >
        {label}
        <Icon
          className={cn(
            "h-3 w-3 shrink-0",
            active ? "text-foreground" : "text-muted-foreground/40",
          )}
        />
      </button>
    </TableHead>
  );
}

/* ── Pagination ──────────────────────────────────────────────────────────── */

function Pagination({
  page,
  totalPages,
  total,
  onPage,
}: {
  page: number;
  totalPages: number;
  total: number;
  onPage: (p: number) => void;
}) {
  const from = Math.min((page - 1) * PAGE_SIZE + 1, total);
  const to   = Math.min(page * PAGE_SIZE, total);

  // Build visible page numbers with ellipsis
  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-1 py-3">
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-medium text-foreground">{from}–{to}</span> of{" "}
        <span className="font-medium text-foreground">{total}</span> students
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`el-${i}`} className="px-2 text-sm text-muted-foreground">
              …
            </span>
          ) : (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              size="icon"
              className="h-8 w-8 text-xs"
              onClick={() => onPage(p as number)}
            >
              {p}
            </Button>
          ),
        )}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={page >= totalPages}
          onClick={() => onPage(page + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */

export function StudentsPage() {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const canCreate = hasPermission("student.create");

  // ── Filter state
  const [search,        setSearch]        = useState("");
  const [filterClass,   setFilterClass]   = useState("all");
  const [filterSection, setFilterSection] = useState("all");
  const [filterStatus,  setFilterStatus]  = useState("all");
  const [filterGender,  setFilterGender]  = useState("all");

  // ── Sort state
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir,   setSortDir]   = useState<SortDir>("asc");

  // ── Pagination
  const [page, setPage] = useState(1);

  // ── Row selection
  const [selected, setSelected] = useState<Set<number>>(new Set());

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
    setPage(1);
  }

  function resetFilters() {
    setSearch("");
    setFilterClass("all");
    setFilterSection("all");
    setFilterStatus("all");
    setFilterGender("all");
    setPage(1);
  }

  const hasActiveFilter =
    search || filterClass !== "all" || filterSection !== "all" ||
    filterStatus !== "all" || filterGender !== "all";

  // ── Computed: filter → sort → paginate
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return STUDENTS.filter((s) => {
      if (q) {
        const hit =
          s.name.toLowerCase().includes(q) ||
          s.admissionNo.toLowerCase().includes(q) ||
          s.registrationNo.toLowerCase().includes(q) ||
          s.parentName.toLowerCase().includes(q);
        if (!hit) return false;
      }
      if (filterClass   !== "all" && s.className !== filterClass) return false;
      if (filterSection !== "all" && (s.section ?? "—") !== filterSection) return false;
      if (filterStatus  !== "all" && s.status !== (filterStatus as StudentStatus)) return false;
      if (filterGender  !== "all" && s.gender !== filterGender) return false;
      return true;
    });
  }, [search, filterClass, filterSection, filterStatus, filterGender]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av: string | number = a[sortField] ?? "";
      const bv: string | number = b[sortField] ?? "";
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [filtered, sortField, sortDir]);

  const totalPages   = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage     = Math.min(page, totalPages);
  const paginated    = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const pageIds      = new Set(paginated.map((s) => s.id));
  const allPageSel   = pageIds.size > 0 && [...pageIds].every((id) => selected.has(id));
  const somePageSel  = [...pageIds].some((id) => selected.has(id)) && !allPageSel;

  function toggleAll(checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      paginated.forEach((s) => (checked ? next.add(s.id) : next.delete(s.id)));
      return next;
    });
  }

  function toggleRow(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const selCount = [...selected].filter((id) => pageIds.has(id)).length;

  // Sort header props shorthand
  const th = (label: string, field: SortField, className?: string) => (
    <SortTh label={label} field={field} current={sortField} dir={sortDir} onSort={handleSort} className={className} />
  );

  return (
    <TooltipProvider delayDuration={300}>
      <div className="space-y-4">

        {/* ── Toolbar ─────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-foreground">
              {sorted.length} student{sorted.length !== 1 ? "s" : ""}{" "}
              {hasActiveFilter && (
                <span className="text-muted-foreground">
                  (filtered from {STUDENTS.length} total)
                </span>
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              Manage enrolled students and their academic records.
            </p>
          </div>
          {canCreate && (
            <Button
              size="sm"
              onClick={() => navigate("/students/new")}
            >
              <Plus className="h-4 w-4" />
              New student
            </Button>
          )}
        </div>

        {/* ── Search + filters ─────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9 pr-9"
              placeholder="Search by name, admission no, reg no…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(""); setPage(1); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Class filter */}
          <select
            className={selectCls}
            value={filterClass}
            onChange={(e) => { setFilterClass(e.target.value); setFilterSection("all"); setPage(1); }}
          >
            <option value="all">All classes</option>
            {CLASS_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Section filter */}
          <select
            className={selectCls}
            value={filterSection}
            onChange={(e) => { setFilterSection(e.target.value); setPage(1); }}
          >
            <option value="all">All sections</option>
            {SECTION_OPTIONS.map((s) => <option key={s} value={s}>Section {s}</option>)}
          </select>

          {/* Status filter */}
          <select
            className={selectCls}
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          >
            <option value="all">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>

          {/* Gender filter */}
          <select
            className={selectCls}
            value={filterGender}
            onChange={(e) => { setFilterGender(e.target.value); setPage(1); }}
          >
            <option value="all">All genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          {/* Reset */}
          {hasActiveFilter && (
            <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-1.5 text-muted-foreground hover:text-foreground">
              <FilterX className="h-4 w-4" />
              Reset
            </Button>
          )}
        </div>

        {/* ── Table card ──────────────────────────────────────────────────── */}
        <Card className="overflow-hidden">
          <div className="w-full overflow-x-auto">
            <Table className="w-full table-fixed">
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  {/* Checkbox */}
                  <TableHead className="w-10 pl-4">
                    <Checkbox
                      checked={allPageSel ? true : somePageSel ? "indeterminate" : false}
                      onCheckedChange={(v) => toggleAll(!!v)}
                      aria-label="Select all on this page"
                    />
                  </TableHead>

                  {th("Reg. No",        "registrationNo", "w-[130px]")}
                  {th("Name",           "name",           "w-[200px]")}
                  {th("Class",          "className",      "w-[90px]")}
                  {th("Roll",           "roll",           "w-[60px]")}

                  {/* Guardian — static */}
                  <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Guardian
                  </TableHead>

                  {/* Mobile — static */}
                  <TableHead className="w-[140px] text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Mobile
                  </TableHead>

                  {th("Status",         "status",         "w-[110px]")}

                  {/* Actions */}
                  <TableHead className="w-24 pr-4 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {/* Empty state */}
                {paginated.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="h-32 text-center">
                      <p className="text-sm font-medium text-foreground">No students found</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Try adjusting your search or filters.
                      </p>
                      {hasActiveFilter && (
                        <Button variant="outline" size="sm" className="mt-3" onClick={resetFilters}>
                          Clear filters
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )}

                {paginated.map((student) => (
                  <StudentRow
                    key={student.id}
                    student={student}
                    selected={selected.has(student.id)}
                    onToggle={() => toggleRow(student.id)}
                  />
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Bulk action bar */}
          {selCount > 0 && (
            <div className="flex items-center gap-3 border-t border-border/60 bg-primary/5 px-4 py-2.5">
              <span className="text-sm font-medium text-foreground">
                {selCount} selected
              </span>
              <Button variant="outline" size="sm" onClick={() => toast.info("Bulk export — coming soon")}>
                Export
              </Button>
              <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => toast.info("Bulk delete — coming soon")}>
                Delete
              </Button>
              <Button variant="ghost" size="sm" className="ml-auto text-muted-foreground" onClick={() => setSelected(new Set())}>
                Deselect all
              </Button>
            </div>
          )}
        </Card>

        {/* ── Pagination ───────────────────────────────────────────────────── */}
        {sorted.length > PAGE_SIZE && (
          <Pagination
            page={safePage}
            totalPages={totalPages}
            total={sorted.length}
            onPage={(p) => { setPage(p); setSelected(new Set()); }}
          />
        )}
      </div>
    </TooltipProvider>
  );
}

/* ── Student row ─────────────────────────────────────────────────────────── */

function StudentRow({
  student,
  selected,
  onToggle,
}: {
  student: Student;
  selected: boolean;
  onToggle: () => void;
}) {
  const navigate = useNavigate();
  return (
    <TableRow
      className={cn(
        "group transition-colors",
        selected && "bg-primary/[0.04]",
      )}
    >
      {/* Checkbox */}
      <TableCell className="w-10 pl-4">
        <Checkbox
          checked={selected}
          onCheckedChange={onToggle}
          aria-label={`Select ${student.name}`}
        />
      </TableCell>

      {/* Registration # */}
      <TableCell>
        <span className="font-mono text-xs text-muted-foreground">
          {student.registrationNo}
        </span>
      </TableCell>

      {/* Name with avatar */}
      <TableCell>
        <div className="flex items-center gap-2.5">
          <StudentAvatar name={student.name} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {student.name}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              {student.email}
            </p>
          </div>
        </div>
      </TableCell>

      {/* Class */}
      <TableCell className="text-sm">{student.className}</TableCell>

      {/* Roll */}
      <TableCell className="tabular-nums text-sm">{student.roll}</TableCell>

      {/* Guardian */}
      <TableCell className="text-sm text-muted-foreground">
        <span className="truncate">{student.parentName}</span>
      </TableCell>

      {/* Mobile */}
      <TableCell className="font-mono text-xs text-muted-foreground">
        {student.mobile}
      </TableCell>

      {/* Status */}
      <TableCell>
        <StudentStatusBadge status={student.status} />
      </TableCell>

      {/* Actions */}
      <TableCell className="pr-4 text-right">
        <div className="flex items-center justify-end gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400"
                onClick={() => navigate(`/students/${student.id}`)}
              >
                <Eye className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">View</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400"
                onClick={() => navigate(`/students/${student.id}/edit`)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">Edit</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400"
                onClick={() => toast.error(`Delete ${student.name}? (static — no action taken)`, { duration: 2000 })}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">Delete</TooltipContent>
          </Tooltip>
        </div>
      </TableCell>
    </TableRow>
  );
}
