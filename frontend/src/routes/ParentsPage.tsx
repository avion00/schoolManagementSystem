import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { ParentAlertsCard } from "@/components/parents/ParentAlertsCard";
import { ParentsByOccupationCard } from "@/components/parents/ParentsByOccupationCard";
import { ParentsOverviewDonut } from "@/components/parents/ParentsOverviewDonut";
import { ParentsSummaryCards } from "@/components/parents/ParentsSummaryCards";
import { ParentsTable } from "@/components/parents/ParentsTable";
import { ParentsToolbar, type ParentsFilters } from "@/components/parents/ParentsToolbar";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { PARENTS, type Parent } from "@/data/parentsData";

const PAGE_SIZE = 10;
type SortField = "parentId" | "name" | "occupation" | "status" | "children";
type SortDir = "asc" | "desc";

const EMPTY_FILTERS: ParentsFilters = {
  search: "", filterOcc: "all", filterGender: "all", filterStatus: "all", filterClass: "all", filterSection: "all",
};

export function ParentsPage() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState<ParentsFilters>(EMPTY_FILTERS);
  const [sortField, setSortField] = useState<SortField>("parentId");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string | number>>(new Set());

  function updateFilters(next: Partial<ParentsFilters>) {
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
    !!filters.search || filters.filterOcc !== "all" || filters.filterGender !== "all" ||
    filters.filterStatus !== "all" || filters.filterClass !== "all" || filters.filterSection !== "all";

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return PARENTS.filter((p) => {
      if (q && ![p.name, p.parentId, p.guardianCode, p.phone, p.email,
        ...p.linkedChildren.map((c) => c.name)].some((v) => v.toLowerCase().includes(q))) return false;
      if (filters.filterOcc !== "all" && p.occupation !== filters.filterOcc) return false;
      if (filters.filterGender !== "all" && p.gender !== filters.filterGender) return false;
      if (filters.filterStatus !== "all" && p.status !== filters.filterStatus) return false;
      if (filters.filterClass !== "all" && !p.linkedChildren.some((c) => c.className === filters.filterClass)) return false;
      if (filters.filterSection !== "all" && !p.linkedChildren.some((c) => c.section === filters.filterSection)) return false;
      return true;
    });
  }, [filters]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
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
  }, [filtered, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated: Parent[] = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="space-y-4">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <PageHeader
        title={
          <>
            {sorted.length} parent{sorted.length !== 1 ? "s" : ""}{" "}
            {hasActiveFilter && (
              <span className="text-base font-normal text-muted-foreground">(filtered from {PARENTS.length} total)</span>
            )}
          </>
        }
        description="Manage parent and guardian information."
        actions={
          <Button size="sm" className="h-9 gap-1.5 rounded-xl" onClick={() => navigate("/parents/new")}>
            <Plus className="h-4 w-4" /> New Parent
          </Button>
        }
      />

      {/* ── Summary ─────────────────────────────────────────────────────── */}
      <ParentsSummaryCards parents={PARENTS} />

      {/* ── Overview: occupation breakdown + alerts ────────────────────── */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <ParentsOverviewDonut parents={PARENTS} />
        </div>
        <div className="lg:col-span-4">
          <ParentsByOccupationCard parents={PARENTS} />
        </div>
        <div className="lg:col-span-3">
          <ParentAlertsCard parents={PARENTS} />
        </div>
      </div>

      {/* ── Filters ─────────────────────────────────────────────────────── */}
      <ParentsToolbar
        filters={filters}
        onFiltersChange={updateFilters}
        hasActiveFilter={hasActiveFilter}
        onReset={resetFilters}
      />

      {/* ── Table ───────────────────────────────────────────────────────── */}
      <ParentsTable
        rows={paginated}
        sortField={sortField}
        sortDir={sortDir}
        onSort={handleSort}
        selected={selected}
        onSelectionChange={setSelected}
        pagination={{ page: safePage, pageSize: PAGE_SIZE, total: sorted.length, onPage: (p) => { setPage(p); setSelected(new Set()); }, itemLabel: "parents" }}
        hasActiveFilter={hasActiveFilter}
        onResetFilters={resetFilters}
      />
    </div>
  );
}
