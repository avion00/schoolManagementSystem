import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PremiumDataTable, type PremiumDataTableColumn } from "@/components/ui/PremiumDataTable";
import { RowActionMenu } from "@/components/ui/RowActionMenu";
import { NoticeStatusBadge }   from "@/components/notices/NoticeStatusBadge";
import { NoticePriorityBadge } from "@/components/notices/NoticePriorityBadge";
import type { Notice } from "@/data/noticesData";

const PAGE_SIZE = 12;
type SortKey = "id" | "title" | "category" | "priority" | "status" | "publishDate" | "publishedBy";

export function NoticeTable({ notices }: { notices: Notice[] }) {
  const navigate = useNavigate();
  const [sort,      setSort]      = useState<SortKey>("id");
  const [dir,       setDir]       = useState<1 | -1>(-1); // newest first
  const [page,      setPage]      = useState(1);
  const [selected,  setSelected]  = useState<Set<string | number>>(new Set());

  function onSort(col: string) {
    const key = col as SortKey;
    if (sort === key) setDir((d) => (d === 1 ? -1 : 1));
    else { setSort(key); setDir(1); }
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

  const columns: PremiumDataTableColumn<Notice>[] = [
    { key: "id", header: "ID", width: "w-[90px]", sortable: true, render: (n) => <span className="font-mono text-[10px] text-muted-foreground whitespace-nowrap">{n.noticeId}</span> },
    {
      key: "title", header: "Title", width: "max-w-[220px]", sortable: true, render: (n) => (
        <div className="flex items-start gap-1.5">
          {n.pinned && <span className="mt-0.5 h-2 w-2 rounded-full bg-indigo-500 shrink-0" title="Pinned" />}
          <button
            className="text-[12px] font-semibold text-foreground hover:text-primary text-left line-clamp-1 transition-colors"
            onClick={() => navigate(`/notices/${n.id}`)}>
            {n.title}
          </button>
        </div>
      ),
    },
    { key: "category", header: "Category", sortable: true, render: (n) => <span className="text-[11px] text-muted-foreground whitespace-nowrap">{n.category}</span> },
    { key: "audience", header: "Audience", render: (n) => <span className="text-[11px] text-muted-foreground whitespace-nowrap">{n.audience}</span> },
    { key: "priority", header: "Priority", sortable: true, render: (n) => <NoticePriorityBadge priority={n.priority} /> },
    { key: "publishedBy", header: "Published By", sortable: true, render: (n) => <span className="text-[12px] text-foreground whitespace-nowrap">{n.publishedBy}</span> },
    { key: "publishDate", header: "Date", sortable: true, render: (n) => <span className="text-[11px] text-muted-foreground whitespace-nowrap">{n.publishDate || <span className="italic">Unpublished</span>}</span> },
    { key: "status", header: "Status", sortable: true, render: (n) => <NoticeStatusBadge status={n.status} /> },
    {
      key: "read", header: "Read", align: "center", render: (n) => (
        n.stats.totalRecipients > 0 ? (
          <span className="text-[12px]">
            <span className="font-medium text-emerald-600">{n.stats.read}</span>
            <span className="text-muted-foreground text-[10px]">/{n.stats.totalRecipients}</span>
          </span>
        ) : (
          <span className="text-muted-foreground text-[12px]">—</span>
        )
      ),
    },
  ];

  return (
    <PremiumDataTable
      columns={columns}
      rows={slice}
      rowKey={(n) => n.id}
      selectable
      selectedKeys={selected}
      onSelectionChange={setSelected}
      sortField={sort}
      sortDir={dir === 1 ? "asc" : "desc"}
      onSort={onSort}
      emptyIcon={Bell}
      emptyTitle="No notices found"
      emptyDescription="Try adjusting your filters."
      pagination={{
        page: pg,
        pageSize: PAGE_SIZE,
        total,
        onPage: setPage,
        itemLabel: "notices",
      }}
      bulkActions={(_count, clear) => (
        <>
          <Button variant="ghost" size="sm" className="ml-auto text-muted-foreground" onClick={clear}>Deselect all</Button>
        </>
      )}
      rowActions={(n) => (
        <RowActionMenu
          entityLabel="notice"
          onView={() => navigate(`/notices/${n.id}`)}
          onEdit={() => navigate(`/notices/${n.id}/edit`)}
          onPrint={() => window.print()}
          onDelete={() => toast.info("Delete notice — coming soon")}
        />
      )}
    />
  );
}
