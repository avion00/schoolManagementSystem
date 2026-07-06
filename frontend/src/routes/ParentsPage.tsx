import { useMemo, useState } from "react";
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

import { ParentAvatar } from "@/components/parents/ParentAvatar";
import { ParentStatusBadge } from "@/components/parents/ParentStatusBadge";
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
  PARENTS, OCCUPATION_OPTIONS, STATUS_OPTIONS, CLASS_OPTIONS, SECTION_OPTIONS,
  type Parent,
} from "@/data/parentsData";

type SortField = "parentId" | "name" | "occupation" | "status" | "children";
const PAGE_SIZE = 10;

function SortableHead({ label, field, current, dir, onSort }: {
  label: string; field: SortField; current: SortField; dir: "asc" | "desc";
  onSort: (f: SortField) => void;
}) {
  const active = field === current;
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

function ParentRow({ parent, selected, onSelect }: {
  parent: Parent; selected: boolean; onSelect: (id: number) => void;
}) {
  const navigate = useNavigate();
  return (
    <TableRow className="group hover:bg-accent/40">
      <TableCell className="w-10">
        <Checkbox checked={selected} onCheckedChange={() => onSelect(parent.id)} />
      </TableCell>
      <TableCell className="font-mono text-xs text-muted-foreground">{parent.parentId}</TableCell>
      <TableCell className="font-mono text-xs text-muted-foreground">{parent.guardianCode}</TableCell>
      <TableCell className="min-w-[160px]">
        <div className="flex items-center gap-2.5">
          <ParentAvatar name={parent.name} size="sm" />
          <div>
            <p className="text-[13px] font-medium leading-tight text-foreground">{parent.name}</p>
            <p className="text-[11px] text-muted-foreground">{parent.relation}</p>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-[13px] text-muted-foreground">{parent.gender}</TableCell>
      <TableCell className="text-[13px]">{parent.relation}</TableCell>
      <TableCell>
        <Badge variant="outline" className="text-[11px] font-medium">{parent.occupation}</Badge>
      </TableCell>
      <TableCell>
        {parent.linkedChildren.length === 0 ? (
          <span className="text-[12px] text-muted-foreground/50">No children</span>
        ) : parent.linkedChildren.length === 1 ? (
          <span className="text-[12.5px] font-medium text-foreground">{parent.linkedChildren[0].name}</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {parent.linkedChildren.slice(0, 2).map((c) => (
              <Badge key={c.id} variant="secondary" className="text-[10px] px-1.5 py-0">{c.name.split(" ")[0]}</Badge>
            ))}
            {parent.linkedChildren.length > 2 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">+{parent.linkedChildren.length - 2}</Badge>
            )}
          </div>
        )}
      </TableCell>
      <TableCell className="font-mono text-[12px] text-muted-foreground">{parent.phone}</TableCell>
      <TableCell className="text-[12px] text-muted-foreground">{parent.email}</TableCell>
      <TableCell><ParentStatusBadge status={parent.status} /></TableCell>
      <TableCell>
        <TooltipProvider>
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate(`/parents/${parent.id}`)}>
                  <Eye className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>View</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate(`/parents/${parent.id}/edit`)}>
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

export function ParentsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterOcc, setFilterOcc] = useState("all");
  const [filterGender, setFilterGender] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterClass, setFilterClass] = useState("all");
  const [filterSection, setFilterSection] = useState("all");
  const [sortField, setSortField] = useState<SortField>("parentId");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);

  const handleSort = (f: SortField) => {
    if (f === sortField) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(f); setSortDir("asc"); }
    setPage(1);
  };

  const resetFilters = () => {
    setSearch(""); setFilterOcc("all"); setFilterGender("all");
    setFilterStatus("all"); setFilterClass("all"); setFilterSection("all");
    setPage(1);
  };

  const hasFilters = search || filterOcc !== "all" || filterGender !== "all" ||
    filterStatus !== "all" || filterClass !== "all" || filterSection !== "all";

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return PARENTS.filter((p) => {
      if (q && ![p.name, p.parentId, p.guardianCode, p.phone, p.email,
        ...p.linkedChildren.map((c) => c.name)].some((v) => v.toLowerCase().includes(q))) return false;
      if (filterOcc !== "all" && p.occupation !== filterOcc) return false;
      if (filterGender !== "all" && p.gender !== filterGender) return false;
      if (filterStatus !== "all" && p.status !== filterStatus) return false;
      if (filterClass !== "all" && !p.linkedChildren.some((c) => c.className === filterClass)) return false;
      if (filterSection !== "all" && !p.linkedChildren.some((c) => c.section === filterSection)) return false;
      return true;
    }).sort((a, b) => {
      let va: string, vb: string;
      switch (sortField) {
        case "parentId":   va = a.parentId;   vb = b.parentId;   break;
        case "name":       va = a.name;        vb = b.name;       break;
        case "occupation": va = a.occupation;  vb = b.occupation; break;
        case "status":     va = a.status;      vb = b.status;     break;
        case "children":   va = String(a.linkedChildren.length); vb = String(b.linkedChildren.length); break;
      }
      return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    });
  }, [search, filterOcc, filterGender, filterStatus, filterClass, filterSection, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSelect = (id: number) =>
    setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  const toggleAll = () =>
    setSelected(paginated.every((p) => selected.includes(p.id)) ? [] : paginated.map((p) => p.id));
  const allChecked = paginated.length > 0 && paginated.every((p) => selected.includes(p.id));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">All Parents</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {filtered.length} of {PARENTS.length} guardians · Manage parent and guardian information.
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => navigate("/parents/new")}>
          <Plus className="h-4 w-4" />
          New Parent
        </Button>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-card p-3 shadow-sm">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search name, parent ID, phone, email, child…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="h-8 pl-8 text-sm"
          />
        </div>
        <Filter className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        {([
          { value: filterOcc,     onChange: (v: string) => { setFilterOcc(v);     setPage(1); }, placeholder: "Occupation", options: OCCUPATION_OPTIONS },
          { value: filterClass,   onChange: (v: string) => { setFilterClass(v);   setPage(1); }, placeholder: "Child Class",   options: CLASS_OPTIONS      },
          { value: filterSection, onChange: (v: string) => { setFilterSection(v); setPage(1); }, placeholder: "Section",    options: SECTION_OPTIONS    },
        ] as const).map(({ value, onChange, placeholder, options }) => (
          <select key={placeholder} value={value} onChange={(e) => onChange(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2 text-[12px] text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
            <option value="all">{placeholder}: All</option>
            {options.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        ))}
        <select value={filterGender} onChange={(e) => { setFilterGender(e.target.value); setPage(1); }}
          className="h-8 rounded-md border border-input bg-background px-2 text-[12px] text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
          <option value="all">Gender: All</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          className="h-8 rounded-md border border-input bg-background px-2 text-[12px] text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
          <option value="all">Status: All</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        {hasFilters && (
          <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-muted-foreground" onClick={resetFilters}>
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
                <TableHead className="w-10">
                  <Checkbox checked={allChecked} onCheckedChange={toggleAll} />
                </TableHead>
                <SortableHead label="Parent ID"  field="parentId"   current={sortField} dir={sortDir} onSort={handleSort} />
                <TableHead className="w-28 text-[12px]">Guardian Code</TableHead>
                <SortableHead label="Name"       field="name"       current={sortField} dir={sortDir} onSort={handleSort} />
                <TableHead className="w-20 text-[12px]">Gender</TableHead>
                <TableHead className="w-28 text-[12px]">Relation</TableHead>
                <SortableHead label="Occupation" field="occupation" current={sortField} dir={sortDir} onSort={handleSort} />
                <SortableHead label="Children"   field="children"   current={sortField} dir={sortDir} onSort={handleSort} />
                <TableHead className="w-36 text-[12px]">Phone</TableHead>
                <TableHead className="w-48 text-[12px]">Email</TableHead>
                <SortableHead label="Status"     field="status"     current={sortField} dir={sortDir} onSort={handleSort} />
                <TableHead className="w-28 text-right text-[12px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="py-16 text-center text-muted-foreground">
                    No parents found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((p) => (
                  <ParentRow key={p.id} parent={p} selected={selected.includes(p.id)} onSelect={toggleSelect} />
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-border/60 px-4 py-3">
          <p className="text-[12px] text-muted-foreground">
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            {selected.length > 0 && <span className="ml-2 font-medium text-primary">· {selected.length} selected</span>}
          </p>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce<(number | "…")[]>((acc, p, i, arr) => {
                if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("…");
                acc.push(p); return acc;
              }, [])
              .map((p, i) => p === "…" ? (
                <span key={`e${i}`} className="px-1 text-xs text-muted-foreground">…</span>
              ) : (
                <Button key={p} variant={p === page ? "default" : "outline"} size="icon" className="h-7 w-7 text-[12px]" onClick={() => setPage(p as number)}>{p}</Button>
              ))}
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
