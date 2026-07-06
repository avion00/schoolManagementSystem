import { useState, useMemo } from "react";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { TeacherAvatar } from "@/components/teachers/TeacherAvatar";
import { TeacherStatusBadge } from "@/components/teachers/TeacherStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  TEACHERS,
  DEPARTMENT_OPTIONS,
  SUBJECT_OPTIONS,
  STATUS_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  type Teacher,
} from "@/data/teachersData";

type SortField = "employeeId" | "name" | "subject" | "department" | "status";

const PAGE_SIZE = 10;

function SortableHead({
  label,
  field,
  current,
  dir,
  onSort,
}: {
  label: string;
  field: SortField;
  current: SortField;
  dir: "asc" | "desc";
  onSort: (f: SortField) => void;
}) {
  const active = field === current;
  return (
    <TableHead
      className="cursor-pointer select-none whitespace-nowrap"
      onClick={() => onSort(field)}
    >
      <span className="flex items-center gap-1">
        {label}
        <ArrowUpDown
          className={`h-3.5 w-3.5 shrink-0 ${active ? "text-primary" : "text-muted-foreground/40"}`}
        />
        {active && <span className="text-[10px] text-primary">{dir === "asc" ? "↑" : "↓"}</span>}
      </span>
    </TableHead>
  );
}

function TeacherRow({
  teacher,
  selected,
  onSelect,
}: {
  teacher: Teacher;
  selected: boolean;
  onSelect: (id: number) => void;
}) {
  const navigate = useNavigate();
  return (
    <TableRow className="group hover:bg-accent/40">
      <TableCell className="w-10">
        <Checkbox
          checked={selected}
          onCheckedChange={() => onSelect(teacher.id)}
          aria-label={`Select ${teacher.name}`}
        />
      </TableCell>
      <TableCell className="font-mono text-xs text-muted-foreground">{teacher.employeeId}</TableCell>
      <TableCell className="font-mono text-xs text-muted-foreground">{teacher.staffCode}</TableCell>
      <TableCell className="min-w-[160px]">
        <div className="flex items-center gap-2.5">
          <TeacherAvatar name={teacher.name} size="sm" />
          <div>
            <p className="text-[13px] font-medium leading-tight text-foreground">{teacher.name}</p>
            <p className="text-[11px] text-muted-foreground">{teacher.designation}</p>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-[13px] text-muted-foreground">{teacher.gender}</TableCell>
      <TableCell>
        <Badge variant="outline" className="text-[11px] font-medium">
          {teacher.department}
        </Badge>
      </TableCell>
      <TableCell className="text-[13px]">{teacher.subject}</TableCell>
      <TableCell>
        {teacher.assignedClasses.length ? (
          <div className="flex flex-wrap gap-1">
            {teacher.assignedClasses.slice(0, 2).map((c) => (
              <Badge key={c} variant="secondary" className="text-[10px] px-1.5 py-0">
                {c}
              </Badge>
            ))}
            {teacher.assignedClasses.length > 2 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                +{teacher.assignedClasses.length - 2}
              </Badge>
            )}
          </div>
        ) : (
          <span className="text-[12px] text-muted-foreground/50">—</span>
        )}
      </TableCell>
      <TableCell className="font-mono text-[12px] text-muted-foreground">{teacher.phone}</TableCell>
      <TableCell className="text-[12px] text-muted-foreground">{teacher.email}</TableCell>
      <TableCell>
        <TeacherStatusBadge status={teacher.status} />
      </TableCell>
      <TableCell>
        <TooltipProvider>
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => navigate(`/teachers/${teacher.id}`)}
                >
                  <Eye className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>View</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => navigate(`/teachers/${teacher.id}/edit`)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => {}}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </TableCell>
    </TableRow>
  );
}

export function TeachersPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterGender, setFilterGender] = useState("all");
  const [filterEmpType, setFilterEmpType] = useState("all");
  const [sortField, setSortField] = useState<SortField>("employeeId");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);

  const handleSort = (f: SortField) => {
    if (f === sortField) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(f); setSortDir("asc"); }
    setPage(1);
  };

  const resetFilters = () => {
    setSearchQuery(""); setFilterDept("all"); setFilterSubject("all");
    setFilterStatus("all"); setFilterGender("all"); setFilterEmpType("all");
    setPage(1);
  };

  const hasFilters = searchQuery || filterDept !== "all" || filterSubject !== "all" ||
    filterStatus !== "all" || filterGender !== "all" || filterEmpType !== "all";

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return TEACHERS.filter((t) => {
      if (q && ![t.name, t.employeeId, t.staffCode, t.email, t.phone, t.subject, t.department]
        .some((v) => v.toLowerCase().includes(q))) return false;
      if (filterDept !== "all" && t.department !== filterDept) return false;
      if (filterSubject !== "all" && t.subject !== filterSubject) return false;
      if (filterStatus !== "all" && t.status !== filterStatus) return false;
      if (filterGender !== "all" && t.gender !== filterGender) return false;
      if (filterEmpType !== "all" && t.employmentType !== filterEmpType) return false;
      return true;
    }).sort((a, b) => {
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
  }, [searchQuery, filterDept, filterSubject, filterStatus, filterGender, filterEmpType, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSelect = (id: number) =>
    setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  const toggleAll = () =>
    setSelected(paginated.every((t) => selected.includes(t.id)) ? [] : paginated.map((t) => t.id));
  const allChecked = paginated.length > 0 && paginated.every((t) => selected.includes(t.id));

  return (
    <div className="space-y-5">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">All Teachers</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {filtered.length} of {TEACHERS.length} staff members
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => navigate("/teachers/new")}>
          <Plus className="h-4 w-4" />
          Add Teacher
        </Button>
      </div>

      {/* ── Search + Filters ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-card p-3 shadow-sm">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search name, ID, email, subject…"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="h-8 pl-8 text-sm"
          />
        </div>

        <Filter className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />

        {(
          [
            { value: filterDept,    onChange: (v: string) => { setFilterDept(v);    setPage(1); }, placeholder: "Department",  options: DEPARTMENT_OPTIONS },
            { value: filterSubject, onChange: (v: string) => { setFilterSubject(v); setPage(1); }, placeholder: "Subject",     options: SUBJECT_OPTIONS    },
          ] as const
        ).map(({ value, onChange, placeholder, options }) => (
          <select
            key={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2 text-[12px] text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="all">{placeholder}: All</option>
            {options.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        ))}

        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          className="h-8 rounded-md border border-input bg-background px-2 text-[12px] text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="all">Status: All</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>

        <select
          value={filterGender}
          onChange={(e) => { setFilterGender(e.target.value); setPage(1); }}
          className="h-8 rounded-md border border-input bg-background px-2 text-[12px] text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="all">Gender: All</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>

        <select
          value={filterEmpType}
          onChange={(e) => { setFilterEmpType(e.target.value); setPage(1); }}
          className="h-8 rounded-md border border-input bg-background px-2 text-[12px] text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="all">Type: All</option>
          {EMPLOYMENT_TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>

        {hasFilters && (
          <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-muted-foreground" onClick={resetFilters}>
            <RotateCcw className="h-3 w-3" />
            Reset
          </Button>
        )}
      </div>

      {/* ── Table ───────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
        <div className="w-full overflow-x-auto">
          <Table className="table-fixed w-full min-w-[1100px]">
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-10">
                  <Checkbox checked={allChecked} onCheckedChange={toggleAll} aria-label="Select all" />
                </TableHead>
                <SortableHead label="Emp. ID"    field="employeeId" current={sortField} dir={sortDir} onSort={handleSort} />
                <TableHead className="w-32 whitespace-nowrap text-[12px]">Staff Code</TableHead>
                <SortableHead label="Name"       field="name"       current={sortField} dir={sortDir} onSort={handleSort} />
                <TableHead className="w-20 whitespace-nowrap text-[12px]">Gender</TableHead>
                <SortableHead label="Department" field="department" current={sortField} dir={sortDir} onSort={handleSort} />
                <SortableHead label="Subject"    field="subject"    current={sortField} dir={sortDir} onSort={handleSort} />
                <TableHead className="w-40 whitespace-nowrap text-[12px]">Classes</TableHead>
                <TableHead className="w-36 whitespace-nowrap text-[12px]">Phone</TableHead>
                <TableHead className="w-48 whitespace-nowrap text-[12px]">Email</TableHead>
                <SortableHead label="Status"     field="status"     current={sortField} dir={sortDir} onSort={handleSort} />
                <TableHead className="w-28 text-right text-[12px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="py-16 text-center text-muted-foreground">
                    No teachers found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((teacher) => (
                  <TeacherRow
                    key={teacher.id}
                    teacher={teacher}
                    selected={selected.includes(teacher.id)}
                    onSelect={toggleSelect}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* ── Pagination ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between border-t border-border/60 px-4 py-3">
          <p className="text-[12px] text-muted-foreground">
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            {selected.length > 0 && <span className="ml-2 font-medium text-primary">· {selected.length} selected</span>}
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce<(number | "…")[]>((acc, p, i, arr) => {
                if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("…");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "…" ? (
                  <span key={`e${i}`} className="text-xs text-muted-foreground px-1">…</span>
                ) : (
                  <Button
                    key={p}
                    variant={p === page ? "default" : "outline"}
                    size="icon"
                    className="h-7 w-7 text-[12px]"
                    onClick={() => setPage(p as number)}
                  >
                    {p}
                  </Button>
                ),
              )}
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
