import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Pencil, Trash2, Printer, Copy, ChevronLeft, ChevronRight, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NoticeStatusBadge }   from "@/components/notices/NoticeStatusBadge";
import { NoticePriorityBadge } from "@/components/notices/NoticePriorityBadge";
import type { Notice } from "@/data/noticesData";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 12;
type SortKey = "id" | "title" | "category" | "priority" | "status" | "publishDate" | "publishedBy";

function SortHead({ col, label, sort, onSort }: {
  col: SortKey; label: string; sort: SortKey; onSort: (c: SortKey) => void;
}) {
  return (
    <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer select-none whitespace-nowrap hover:text-foreground"
      onClick={() => onSort(col)}>
      <span className="inline-flex items-center gap-1">
        {label}
        <ChevronsUpDown className={cn("h-3 w-3", sort === col ? "text-primary" : "opacity-40")} />
      </span>
    </th>
  );
}

export function NoticeTable({ notices }: { notices: Notice[] }) {
  const navigate = useNavigate();
  const [sort,      setSort]      = useState<SortKey>("id");
  const [dir,       setDir]       = useState<1 | -1>(-1); // newest first
  const [page,      setPage]      = useState(1);
  const [selected,  setSelected]  = useState<Set<number>>(new Set());

  function onSort(col: SortKey) {
    if (sort === col) setDir((d) => (d === 1 ? -1 : 1));
    else { setSort(col); setDir(1); }
    setPage(1);
  }

  const sorted = [...notices].sort((a, b) => {
    let av: string | number = "", bv: string | number = "";
    if (sort === "id")           { av = a.id;           bv = b.id; }
    else if (sort === "title")   { av = a.title;        bv = b.title; }
    else if (sort === "category"){ av = a.category;     bv = b.category; }
    else if (sort === "priority"){ av = a.priority;     bv = b.priority; }
    else if (sort === "status")  { av = a.status;       bv = b.status; }
    else if (sort === "publishDate") { av = a.publishDate; bv = b.publishDate; }
    else if (sort === "publishedBy") { av = a.publishedBy; bv = b.publishedBy; }
    if (av < bv) return -dir;
    if (av > bv) return  dir;
    return 0;
  });

  const total = sorted.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pg    = Math.min(page, pages);
  const slice = sorted.slice((pg - 1) * PAGE_SIZE, pg * PAGE_SIZE);

  const allSelected = slice.length > 0 && slice.every((n) => selected.has(n.id));
  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) slice.forEach((n) => next.delete(n.id));
      else slice.forEach((n) => next.add(n.id));
      return next;
    });
  }

  if (total === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 py-16 text-center">
        <p className="text-[14px] font-medium text-foreground">No notices found</p>
        <p className="text-[12px] text-muted-foreground mt-1">Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {selected.size > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-primary/10 border border-primary/20 px-3 py-2">
          <span className="text-[12px] text-primary font-medium">{selected.size} selected</span>
          <button onClick={() => setSelected(new Set())} className="text-[11px] text-muted-foreground hover:text-foreground ml-auto">Clear</button>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border/60 shadow-sm">
        <table className="min-w-full text-[12px]">
          <thead className="bg-muted/40 border-b border-border/60">
            <tr>
              <th className="px-3 py-2.5 w-8">
                <input type="checkbox" checked={allSelected} onChange={toggleAll}
                  className="rounded border-border accent-primary cursor-pointer" />
              </th>
              <SortHead col="id"          label="ID"         sort={sort} onSort={onSort} />
              <SortHead col="title"       label="Title"      sort={sort} onSort={onSort} />
              <SortHead col="category"    label="Category"   sort={sort} onSort={onSort} />
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">Audience</th>
              <SortHead col="priority"    label="Priority"   sort={sort} onSort={onSort} />
              <SortHead col="publishedBy" label="Published By" sort={sort} onSort={onSort} />
              <SortHead col="publishDate" label="Date"       sort={sort} onSort={onSort} />
              <SortHead col="status"      label="Status"     sort={sort} onSort={onSort} />
              <th className="px-3 py-2.5 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">Read</th>
              <th className="px-3 py-2.5 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {slice.map((n) => (
              <tr key={n.id} className={cn(
                "group hover:bg-muted/20 transition-colors",
                selected.has(n.id) && "bg-primary/5",
              )}>
                <td className="px-3 py-2.5">
                  <input type="checkbox" checked={selected.has(n.id)}
                    onChange={() => setSelected((prev) => {
                      const next = new Set(prev);
                      if (next.has(n.id)) next.delete(n.id); else next.add(n.id);
                      return next;
                    })}
                    className="rounded border-border accent-primary cursor-pointer" />
                </td>
                <td className="px-3 py-2.5 font-mono text-[10px] text-muted-foreground whitespace-nowrap">{n.noticeId}</td>
                <td className="px-3 py-2.5 max-w-[220px]">
                  <div className="flex items-start gap-1.5">
                    {n.pinned && <span className="mt-0.5 h-2 w-2 rounded-full bg-indigo-500 shrink-0" title="Pinned" />}
                    <button
                      className="text-[12px] font-semibold text-foreground hover:text-primary text-left line-clamp-1 transition-colors"
                      onClick={() => navigate(`/notices/${n.id}`)}>
                      {n.title}
                    </button>
                  </div>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <span className="text-[11px] text-muted-foreground">{n.category}</span>
                </td>
                <td className="px-3 py-2.5 text-[11px] text-muted-foreground whitespace-nowrap">{n.audience}</td>
                <td className="px-3 py-2.5"><NoticePriorityBadge priority={n.priority} /></td>
                <td className="px-3 py-2.5 text-[12px] text-foreground whitespace-nowrap">{n.publishedBy}</td>
                <td className="px-3 py-2.5 text-[11px] text-muted-foreground whitespace-nowrap">
                  {n.publishDate || <span className="italic">Unpublished</span>}
                </td>
                <td className="px-3 py-2.5"><NoticeStatusBadge status={n.status} /></td>
                <td className="px-3 py-2.5 text-center text-[12px]">
                  {n.stats.totalRecipients > 0 ? (
                    <span className="font-medium text-emerald-600">{n.stats.read}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                  {n.stats.totalRecipients > 0 && (
                    <span className="text-muted-foreground text-[10px]">/{n.stats.totalRecipients}</span>
                  )}
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => navigate(`/notices/${n.id}`)} className="rounded p-1.5 hover:bg-muted" title="View">
                      <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    <button onClick={() => navigate(`/notices/${n.id}/edit`)} className="rounded p-1.5 hover:bg-muted" title="Edit">
                      <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    <button className="rounded p-1.5 hover:bg-muted" title="Print">
                      <Printer className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    <button className="rounded p-1.5 hover:bg-muted" title="Duplicate">
                      <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    <button className="rounded p-1.5 hover:bg-rose-100" title="Delete">
                      <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-[11px] text-muted-foreground">
            Showing {(pg - 1) * PAGE_SIZE + 1}–{Math.min(pg * PAGE_SIZE, total)} of {total}
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-7 w-7" disabled={pg <= 1} onClick={() => setPage(pg - 1)}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <Button key={n} variant={pg === n ? "default" : "outline"} size="icon"
                className="h-7 w-7 text-[11px]" onClick={() => setPage(n)}>
                {n}
              </Button>
            ))}
            <Button variant="outline" size="icon" className="h-7 w-7" disabled={pg >= pages} onClick={() => setPage(pg + 1)}>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
