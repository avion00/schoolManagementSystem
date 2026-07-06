import { useState, useMemo } from "react";
import { useNavigate }       from "react-router-dom";
import {
  BookOpen, ChevronDown, ChevronUp, ChevronsUpDown, Eye, Plus, Search,
} from "lucide-react";
import { Button }             from "@/components/ui/button";
import { Card, CardContent }  from "@/components/ui/card";
import { Input }              from "@/components/ui/input";
import { SubjectStatusBadge } from "@/components/subjects/SubjectStatusBadge";
import { SubjectTypeBadge }   from "@/components/subjects/SubjectTypeBadge";
import {
  SUBJECTS, SUBJECT_STATS, SUBJECT_TYPE_OPTIONS, SUBJECT_CATEGORY_OPTIONS,
  SUBJECT_STATUS_OPTIONS, type SubjectData, type SubjectCategory, type SubjectType, type SubjectStatus,
} from "@/data/subjectsData";

// ─── summary stat card ───────────────────────────────────────────────────────
function StatCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardContent className="p-4">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className={`text-[22px] font-bold ${color}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

// ─── sortable header ─────────────────────────────────────────────────────────
type SortKey = "subjectName" | "subjectCode" | "category" | "type" | "weeklyPeriods" | "fullMarks" | "status";

function SortHead({ col, label, sort, onSort }: { col: SortKey; label: string; sort: { key: SortKey; asc: boolean }; onSort: (k: SortKey) => void }) {
  const active = sort.key === col;
  const Icon = active ? (sort.asc ? ChevronUp : ChevronDown) : ChevronsUpDown;
  return (
    <th className="pb-2 pr-4 text-left">
      <button onClick={() => onSort(col)} className="flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground whitespace-nowrap text-[12px]">
        {label} <Icon className="h-3 w-3" />
      </button>
    </th>
  );
}

const CAT_COLOR: Record<SubjectCategory, string> = {
  "Compulsory":      "bg-violet-50 text-violet-700 ring-violet-500/30 dark:bg-violet-950/40 dark:text-violet-400",
  "Optional":        "bg-amber-50 text-amber-700 ring-amber-500/30 dark:bg-amber-950/40 dark:text-amber-400",
  "Language":        "bg-blue-50 text-blue-700 ring-blue-500/30 dark:bg-blue-950/40 dark:text-blue-400",
  "Science":         "bg-emerald-50 text-emerald-700 ring-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-400",
  "Commerce":        "bg-teal-50 text-teal-700 ring-teal-500/30 dark:bg-teal-950/40 dark:text-teal-400",
  "Technical":       "bg-indigo-50 text-indigo-700 ring-indigo-500/30 dark:bg-indigo-950/40 dark:text-indigo-400",
  "Extra-curricular":"bg-rose-50 text-rose-700 ring-rose-500/30 dark:bg-rose-950/40 dark:text-rose-400",
};

function CatBadge({ cat }: { cat: SubjectCategory }) {
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${CAT_COLOR[cat]}`}>{cat}</span>;
}

// ─── main page ───────────────────────────────────────────────────────────────
export function SubjectsPage() {
  const navigate = useNavigate();

  const [search,   setSearch]   = useState("");
  const [typeF,    setTypeF]    = useState<SubjectType | "">("");
  const [catF,     setCatF]     = useState<SubjectCategory | "">("");
  const [statusF,  setStatusF]  = useState<SubjectStatus | "">("");
  const [yearF,    setYearF]    = useState("");
  const [sort,     setSort]     = useState<{ key: SortKey; asc: boolean }>({ key: "subjectName", asc: true });
  const [page,     setPage]     = useState(1);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const PER_PAGE = 10;

  function toggleSort(k: SortKey) {
    setSort((s) => s.key === k ? { key: k, asc: !s.asc } : { key: k, asc: true });
    setPage(1);
  }

  const filtered = useMemo(() => {
    let list = SUBJECTS.filter((s) => {
      if (search && !s.subjectName.toLowerCase().includes(search.toLowerCase()) && !s.subjectCode.toLowerCase().includes(search.toLowerCase())) return false;
      if (typeF   && s.type     !== typeF)   return false;
      if (catF    && s.category !== catF)    return false;
      if (statusF && s.status   !== statusF) return false;
      if (yearF   && s.academicYear !== yearF) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      const av = a[sort.key as keyof SubjectData];
      const bv = b[sort.key as keyof SubjectData];
      if (typeof av === "number" && typeof bv === "number") return sort.asc ? av - bv : bv - av;
      return sort.asc
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return list;
  }, [search, typeF, catF, statusF, yearF, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageData   = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const allSelected = pageData.length > 0 && pageData.every((s) => selected.has(s.id));
  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) pageData.forEach((s) => next.delete(s.id));
      else             pageData.forEach((s) => next.add(s.id));
      return next;
    });
  }

  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3)             pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="space-y-5 pb-12">
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-foreground">Subjects</h1>
          <p className="text-[12px] text-muted-foreground">Manage curriculum subjects, mark structures, and class assignments.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="h-8 gap-1.5 text-[11px]"
            onClick={() => navigate("/subjects/subject-form/print")}>
            <BookOpen className="h-3.5 w-3.5" />Print Form
          </Button>
          <Button size="sm" className="h-8 gap-1.5 text-[11px]"
            onClick={() => navigate("/subjects/new")}>
            <Plus className="h-3.5 w-3.5" />Add Subject
          </Button>
        </div>
      </div>

      {/* summary cards */}
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Total Subjects"  value={SUBJECT_STATS.total}      color="text-foreground"                                          />
        <StatCard label="Compulsory"      value={SUBJECT_STATS.compulsory} color="text-violet-600 dark:text-violet-400"                     />
        <StatCard label="Optional"        value={SUBJECT_STATS.optional}   color="text-amber-600 dark:text-amber-400"                       />
        <StatCard label="Practical"       value={SUBJECT_STATS.practical}  color="text-blue-600 dark:text-blue-400"                         />
        <StatCard label="Teachers"        value={SUBJECT_STATS.teachers}   color="text-emerald-600 dark:text-emerald-400"                   />
        <StatCard label="Classes Covered" value={SUBJECT_STATS.classes}    color="text-indigo-600 dark:text-indigo-400"                     />
      </div>

      {/* filters */}
      <Card className="border-border/60 shadow-sm">
        <CardContent className="p-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search subject name or code…"
                className="h-8 pl-8 text-[12px]" />
            </div>
            {[
              { val: typeF,   set: setTypeF,   opts: SUBJECT_TYPE_OPTIONS,     placeholder: "All Types"      },
              { val: catF,    set: setCatF,     opts: SUBJECT_CATEGORY_OPTIONS, placeholder: "All Categories" },
              { val: statusF, set: setStatusF,  opts: SUBJECT_STATUS_OPTIONS,   placeholder: "All Statuses"   },
              { val: yearF,   set: setYearF,    opts: ["2026/27","2025/26","2024/25"], placeholder: "All Years" },
            ].map(({ val, set, opts, placeholder }) => (
              <select key={placeholder} value={val}
                onChange={(e) => { (set as (v: string) => void)(e.target.value); setPage(1); }}
                className="h-8 rounded-md border border-input bg-background px-2 text-[12px] text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
                <option value="">{placeholder}</option>
                {opts.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ))}
            {(search || typeF || catF || statusF || yearF) && (
              <Button size="sm" variant="ghost" className="h-8 text-[11px]"
                onClick={() => { setSearch(""); setTypeF(""); setCatF(""); setStatusF(""); setYearF(""); setPage(1); }}>
                Clear
              </Button>
            )}
            <span className="ml-auto text-[11px] text-muted-foreground">{filtered.length} results</span>
          </div>
        </CardContent>
      </Card>

      {/* table */}
      <Card className="border-border/60 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead className="border-b border-border/60 bg-muted/30">
                <tr>
                  <th className="w-8 py-2.5 pl-4 pr-2">
                    <input type="checkbox" checked={allSelected} onChange={toggleAll}
                      className="h-3.5 w-3.5 rounded border-border" />
                  </th>
                  <SortHead col="subjectCode"   label="Code"        sort={sort} onSort={toggleSort} />
                  <SortHead col="subjectName"   label="Subject"     sort={sort} onSort={toggleSort} />
                  <SortHead col="type"          label="Type"        sort={sort} onSort={toggleSort} />
                  <SortHead col="category"      label="Category"    sort={sort} onSort={toggleSort} />
                  <th className="pb-2 pr-4 text-left text-[12px] font-medium text-muted-foreground whitespace-nowrap">Primary Teacher</th>
                  <SortHead col="weeklyPeriods" label="Periods/Wk"  sort={sort} onSort={toggleSort} />
                  <SortHead col="fullMarks"     label="Full Marks"  sort={sort} onSort={toggleSort} />
                  <th className="pb-2 pr-4 text-left text-[12px] font-medium text-muted-foreground whitespace-nowrap">Classes</th>
                  <SortHead col="status"        label="Status"      sort={sort} onSort={toggleSort} />
                  <th className="w-10 pb-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {pageData.map((s) => (
                  <tr key={s.id} className="group hover:bg-muted/30 transition-colors">
                    <td className="py-3 pl-4 pr-2">
                      <input type="checkbox" checked={selected.has(s.id)}
                        onChange={() => setSelected((prev) => {
                          const n = new Set(prev);
                          n.has(s.id) ? n.delete(s.id) : n.add(s.id);
                          return n;
                        })}
                        className="h-3.5 w-3.5 rounded border-border" />
                    </td>
                    <td className="py-3 pr-4 font-mono text-[11px] text-muted-foreground whitespace-nowrap">{s.subjectCode}</td>
                    <td className="py-3 pr-4">
                      <p className="font-medium text-foreground whitespace-nowrap">{s.subjectName}</p>
                      <p className="text-[10.5px] text-muted-foreground">{s.department}</p>
                    </td>
                    <td className="py-3 pr-4 whitespace-nowrap"><SubjectTypeBadge type={s.type} /></td>
                    <td className="py-3 pr-4 whitespace-nowrap"><CatBadge cat={s.category} /></td>
                    <td className="py-3 pr-4 whitespace-nowrap text-foreground">{s.primaryTeacher.name}</td>
                    <td className="py-3 pr-4 text-center text-foreground">{s.weeklyPeriods}</td>
                    <td className="py-3 pr-4 text-center text-foreground">{s.fullMarks}</td>
                    <td className="py-3 pr-4">
                      <span className="text-[11px] text-muted-foreground">
                        {s.assignedClasses.length > 3
                          ? `${s.assignedClasses.slice(0, 2).join(", ")} +${s.assignedClasses.length - 2}`
                          : s.assignedClasses.join(", ")}
                      </span>
                    </td>
                    <td className="py-3 pr-4 whitespace-nowrap"><SubjectStatusBadge status={s.status} /></td>
                    <td className="py-3 pr-4">
                      <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100"
                        onClick={() => navigate(`/subjects/${s.id}`)}>
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <p className="py-12 text-center text-[13px] text-muted-foreground">No subjects match the current filters.</p>
          )}

          {/* pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border/60 px-4 py-3">
              <p className="text-[11px] text-muted-foreground">
                Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-[11px]"
                  disabled={page === 1} onClick={() => setPage((p) => p - 1)}>‹</Button>
                {pages.map((p, i) =>
                  p === "..."
                    ? <span key={i} className="px-1 text-muted-foreground text-[11px]">…</span>
                    : <Button key={p} size="sm" variant={page === p ? "default" : "ghost"}
                        className="h-7 w-7 p-0 text-[11px]" onClick={() => setPage(p as number)}>
                        {p}
                      </Button>
                )}
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-[11px]"
                  disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>›</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
