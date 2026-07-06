import { useMemo, useState } from "react";
import {
  ArrowUpDown, BookOpen, CalendarCheck, ChevronLeft, ChevronRight,
  Eye, Filter, Layers, Pencil, Plus, RotateCcw, Search, Trash2, Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { ClassStatusBadge } from "@/components/classes/ClassStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CLASSES, CLASS_STATS, ACADEMIC_YEAR_OPTIONS, MEDIUM_OPTIONS, SHIFT_OPTIONS, STATUS_OPTIONS,
  type ClassData,
} from "@/data/classesData";

type SortField = "classId" | "className" | "totalStudents" | "totalCapacity" | "academicYear" | "status";
const PAGE_SIZE = 10;

// ── Summary cards ──────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color }: {
  icon: typeof Layers; label: string; value: string | number; color: string;
}) {
  return (
    <div className={`flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-sm ${color}`}>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-current/10">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold leading-none">{value}</p>
        <p className="mt-0.5 text-[11px] font-medium opacity-70">{label}</p>
      </div>
    </div>
  );
}

// ── Sort head ─────────────────────────────────────────────────────────────────
function SortHead({ label, field, cur, dir, onSort }: {
  label: string; field: SortField; cur: SortField; dir: "asc" | "desc";
  onSort: (f: SortField) => void;
}) {
  const active = field === cur;
  return (
    <TableHead className="cursor-pointer select-none whitespace-nowrap" onClick={() => onSort(field)}>
      <span className="flex items-center gap-1">
        {label}
        <ArrowUpDown className={`h-3.5 w-3.5 shrink-0 ${active ? "text-primary" : "text-muted-foreground/40"}`} />
        {active && <span className="text-[10px] text-primary">{dir === "asc" ? "↑" : "↓"}</span>}
      </span>
    </TableHead>
  );
}

// ── Row ───────────────────────────────────────────────────────────────────────
function ClassRow({ cls, selected, onSelect }: {
  cls: ClassData; selected: boolean; onSelect: (id: number) => void;
}) {
  const navigate = useNavigate();
  const usedPct = Math.round((cls.totalStudents / cls.totalCapacity) * 100);
  return (
    <TableRow className="group hover:bg-accent/40">
      <TableCell className="w-10">
        <Checkbox checked={selected} onCheckedChange={() => onSelect(cls.id)} />
      </TableCell>
      <TableCell className="font-mono text-xs text-muted-foreground">{cls.classId}</TableCell>
      <TableCell className="min-w-[130px]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-[12px] font-bold text-primary">
            {cls.gradeLevel}
          </div>
          <p className="text-[13px] font-medium text-foreground">{cls.className}</p>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {cls.sections.map((s) => (
            <Badge key={s.id} variant="outline" className="text-[10px] px-1.5 py-0">{s.sectionName}</Badge>
          ))}
        </div>
      </TableCell>
      <TableCell className="text-[12.5px] text-muted-foreground">{cls.mainClassTeacher.name}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-foreground">{cls.totalStudents}</span>
          <div className="h-1.5 w-14 overflow-hidden rounded-full bg-muted">
            <div className={`h-full rounded-full ${usedPct >= 90 ? "bg-rose-500" : usedPct >= 70 ? "bg-amber-500" : "bg-emerald-500"}`}
              style={{ width: `${usedPct}%` }} />
          </div>
        </div>
      </TableCell>
      <TableCell className="text-[12.5px] text-muted-foreground">{cls.totalCapacity}</TableCell>
      <TableCell className="text-[12.5px] text-muted-foreground">{cls.mainRoom}</TableCell>
      <TableCell className="text-[12.5px] text-muted-foreground">{cls.shift}</TableCell>
      <TableCell className="text-[12.5px] text-muted-foreground">{cls.medium}</TableCell>
      <TableCell className="text-[12px] font-mono text-muted-foreground">{cls.academicYear}</TableCell>
      <TableCell><ClassStatusBadge status={cls.status} /></TableCell>
      <TableCell>
        <TooltipProvider>
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate(`/classes/${cls.id}`)}>
                  <Eye className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>View</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate(`/classes/${cls.id}/edit`)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => {}}>
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

// ── Page ──────────────────────────────────────────────────────────────────────
export function ClassesPage() {
  const navigate = useNavigate();
  const [search,        setSearch]       = useState("");
  const [filterYear,    setFilterYear]   = useState("all");
  const [filterMedium,  setFilterMedium] = useState("all");
  const [filterShift,   setFilterShift]  = useState("all");
  const [filterStatus,  setFilterStatus] = useState("all");
  const [sortField,     setSortField]    = useState<SortField>("classId");
  const [sortDir,       setSortDir]      = useState<"asc" | "desc">("asc");
  const [page,          setPage]         = useState(1);
  const [selected,      setSelected]     = useState<number[]>([]);

  const handleSort = (f: SortField) => {
    if (f === sortField) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(f); setSortDir("asc"); }
    setPage(1);
  };

  const reset = () => {
    setSearch(""); setFilterYear("all"); setFilterMedium("all");
    setFilterShift("all"); setFilterStatus("all"); setPage(1);
  };

  const hasFilters = search || filterYear !== "all" || filterMedium !== "all" || filterShift !== "all" || filterStatus !== "all";

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return CLASSES.filter((c) => {
      if (q && ![c.className, c.classId, c.mainClassTeacher.name, c.mainRoom,
        ...c.sections.map((s) => s.sectionName)].some((v) => v.toLowerCase().includes(q))) return false;
      if (filterYear   !== "all" && c.academicYear !== filterYear)   return false;
      if (filterMedium !== "all" && c.medium        !== filterMedium) return false;
      if (filterShift  !== "all" && c.shift         !== filterShift)  return false;
      if (filterStatus !== "all" && c.status        !== filterStatus) return false;
      return true;
    }).sort((a, b) => {
      let va: string, vb: string;
      switch (sortField) {
        case "classId":       va = a.classId;           vb = b.classId;           break;
        case "className":     va = a.className;         vb = b.className;         break;
        case "totalStudents": va = String(a.totalStudents); vb = String(b.totalStudents); break;
        case "totalCapacity": va = String(a.totalCapacity); vb = String(b.totalCapacity); break;
        case "academicYear":  va = a.academicYear;      vb = b.academicYear;      break;
        case "status":        va = a.status;            vb = b.status;            break;
        default:              va = a.classId;           vb = b.classId;
      }
      return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    });
  }, [search, filterYear, filterMedium, filterShift, filterStatus, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSelect = (id: number) =>
    setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  const toggleAll = () =>
    setSelected(paginated.every((c) => selected.includes(c.id)) ? [] : paginated.map((c) => c.id));
  const allChecked = paginated.length > 0 && paginated.every((c) => selected.includes(c.id));

  const selectEl = (value: string, onChange: (v: string) => void, options: string[], placeholder: string) => (
    <select value={value} onChange={(e) => { onChange(e.target.value); setPage(1); }}
      className="h-8 rounded-md border border-input bg-background px-2 text-[12px] text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
      <option value="all">{placeholder}: All</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );

  return (
    <div className="space-y-5 pb-12">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard icon={Layers}        label="Total Classes"   value={CLASS_STATS.totalClasses}   color="text-violet-600 dark:text-violet-400" />
        <StatCard icon={BookOpen}      label="Total Sections"  value={CLASS_STATS.totalSections}  color="text-blue-600 dark:text-blue-400"   />
        <StatCard icon={Users}         label="Total Students"  value={CLASS_STATS.totalStudents.toLocaleString()}  color="text-emerald-600 dark:text-emerald-400" />
        <StatCard icon={Users}         label="Class Teachers"  value={CLASS_STATS.totalTeachers}  color="text-amber-600 dark:text-amber-400" />
        <StatCard icon={CalendarCheck} label="Available Seats" value={CLASS_STATS.availableSeats} color="text-rose-600 dark:text-rose-400"   />
        <StatCard icon={BookOpen}      label="Academic Year"   value={CLASS_STATS.academicYear}   color="text-indigo-600 dark:text-indigo-400" />
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">All Classes</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {filtered.length} of {CLASSES.length} classes · Manage classes, sections, teachers, subjects, and student allocation.
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => navigate("/classes/new")}>
          <Plus className="h-4 w-4" />Add New Class
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-card p-3 shadow-sm">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search class, teacher, room, section…" value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="h-8 pl-8 text-sm" />
        </div>
        <Filter className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        {selectEl(filterYear,   setFilterYear,   ACADEMIC_YEAR_OPTIONS, "Year"   )}
        {selectEl(filterMedium, setFilterMedium, MEDIUM_OPTIONS,        "Medium" )}
        {selectEl(filterShift,  setFilterShift,  SHIFT_OPTIONS,         "Shift"  )}
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          className="h-8 rounded-md border border-input bg-background px-2 text-[12px] text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
          <option value="all">Status: All</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
        </select>
        {hasFilters && (
          <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-muted-foreground" onClick={reset}>
            <RotateCcw className="h-3 w-3" />Reset
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
        <div className="w-full overflow-x-auto">
          <Table className="table-fixed w-full min-w-[1200px]">
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-10"><Checkbox checked={allChecked} onCheckedChange={toggleAll} /></TableHead>
                <SortHead label="Class ID"      field="classId"       cur={sortField} dir={sortDir} onSort={handleSort} />
                <SortHead label="Class Name"    field="className"     cur={sortField} dir={sortDir} onSort={handleSort} />
                <TableHead className="text-[12px]">Sections</TableHead>
                <TableHead className="text-[12px]">Class Teacher</TableHead>
                <SortHead label="Students"      field="totalStudents" cur={sortField} dir={sortDir} onSort={handleSort} />
                <SortHead label="Capacity"      field="totalCapacity" cur={sortField} dir={sortDir} onSort={handleSort} />
                <TableHead className="text-[12px]">Room</TableHead>
                <TableHead className="text-[12px]">Shift</TableHead>
                <TableHead className="text-[12px]">Medium</TableHead>
                <SortHead label="Acad. Year"    field="academicYear"  cur={sortField} dir={sortDir} onSort={handleSort} />
                <SortHead label="Status"        field="status"        cur={sortField} dir={sortDir} onSort={handleSort} />
                <TableHead className="w-24 text-right text-[12px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={13} className="py-16 text-center text-muted-foreground">
                    No classes found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((c) => (
                  <ClassRow key={c.id} cls={c} selected={selected.includes(c.id)} onSelect={toggleSelect} />
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-border/60 px-4 py-3">
          <p className="text-[12px] text-muted-foreground">
            Showing {Math.min((page-1)*PAGE_SIZE+1, filtered.length)}–{Math.min(page*PAGE_SIZE, filtered.length)} of {filtered.length} classes
            {selected.length > 0 && <span className="ml-2 font-medium text-primary">· {selected.length} selected</span>}
          </p>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setPage((p) => Math.max(1, p-1))} disabled={page===1}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce<(number|"…")[]>((acc, p, i, arr) => {
                if (i > 0 && p - (arr[i-1] as number) > 1) acc.push("…");
                acc.push(p); return acc;
              }, [])
              .map((p, i) => p === "…" ? (
                <span key={`e${i}`} className="px-1 text-xs text-muted-foreground">…</span>
              ) : (
                <Button key={p} variant={p === page ? "default" : "outline"} size="icon"
                  className="h-7 w-7 text-[12px]" onClick={() => setPage(p as number)}>{p}</Button>
              ))}
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setPage((p) => Math.min(totalPages, p+1))} disabled={page===totalPages}>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
