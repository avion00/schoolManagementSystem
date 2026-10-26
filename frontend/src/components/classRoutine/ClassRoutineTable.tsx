import { AlertTriangle, CalendarClock } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

import { ClassRoutineStatusBadge } from "@/components/classRoutine/ClassRoutineStatusBadge";
import { Button } from "@/components/ui/button";
import { PremiumDataTable, type PremiumDataTableColumn } from "@/components/ui/PremiumDataTable";
import { RowActionMenu } from "@/components/ui/RowActionMenu";
import { useDeleteEntry, useRoutineData } from "@/api/routine";
import { errorMessage } from "@/api/http";
import type { RoutineEntry } from "@/api/types/routine";

type SortKey = "routineId" | "day" | "className" | "section" | "subject" | "teacher" | "room" | "startTime" | "periodNo" | "shift" | "status";

const DAY_ORDER: Record<string, number> = {
  Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6,
};

const DAY_BADGE: Record<string, string> = {
  Sunday: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400",
  Monday: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  Tuesday: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  Wednesday: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  Thursday: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400",
  Friday: "bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400",
  Saturday: "bg-muted text-muted-foreground",
};

const PER_PAGE = 15;

interface Props {
  routines: RoutineEntry[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function ClassRoutineTable({ routines, onView, onEdit }: Props) {
  const { routine } = useRoutineData();
  const CONFLICT_IDS = routine.conflictIds;
  const remove = useDeleteEntry();
  const [sort, setSort] = useState<{ key: SortKey; asc: boolean }>({ key: "day", asc: true });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string | number>>(new Set());

  function toggleSort(key: string) {
    const k = key as SortKey;
    setSort((s) => (s.key === k ? { key: k, asc: !s.asc } : { key: k, asc: true }));
    setPage(1);
  }

  const sorted = [...routines].sort((a, b) => {
    const k = sort.key;
    let av: string | number = a[k as keyof RoutineEntry] as string | number;
    let bv: string | number = b[k as keyof RoutineEntry] as string | number;
    if (k === "day") { av = DAY_ORDER[a.day]; bv = DAY_ORDER[b.day]; }
    if (typeof av === "number" && typeof bv === "number") return sort.asc ? av - bv : bv - av;
    return sort.asc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = sorted.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const columns: PremiumDataTableColumn<RoutineEntry>[] = [
    {
      key: "routineId", header: "Routine ID", width: "w-[130px]", sortable: true, render: (r) => (
        <div className="flex items-center gap-1">
          <span className="font-mono text-[11px] text-muted-foreground">{r.routineId}</span>
          {CONFLICT_IDS.has(r.id) && <AlertTriangle className="h-3 w-3 shrink-0 text-rose-500" />}
        </div>
      ),
    },
    { key: "day", header: "Day", width: "w-[100px]", sortable: true, render: (r) => <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${DAY_BADGE[r.day] ?? ""}`}>{r.day}</span> },
    { key: "className", header: "Class", width: "w-[100px]", sortable: true, render: (r) => <span className="whitespace-nowrap text-sm font-medium text-foreground">{r.className}</span> },
    { key: "section", header: "Section", width: "w-[90px]", sortable: true, render: (r) => <span className="text-sm text-muted-foreground">Sec {r.section}</span> },
    { key: "subject", header: "Subject", width: "w-[160px]", sortable: true, render: (r) => <span className="whitespace-nowrap text-sm font-medium text-foreground">{r.subject}</span> },
    { key: "teacher", header: "Teacher", width: "w-[140px]", sortable: true, render: (r) => <span className="whitespace-nowrap text-sm text-muted-foreground">{r.teacher}</span> },
    { key: "room", header: "Room", width: "w-[110px]", sortable: true, render: (r) => <span className="text-sm text-muted-foreground">{r.room}</span> },
    { key: "startTime", header: "Start Time", width: "w-[100px]", sortable: true, render: (r) => <span className="whitespace-nowrap text-sm text-muted-foreground">{r.startTime}</span> },
    { key: "endTime", header: "End Time", width: "w-[100px]", render: (r) => <span className="whitespace-nowrap text-sm text-muted-foreground">{r.endTime}</span> },
    { key: "duration", header: "Dur.", width: "w-[70px]", render: (r) => <span className="whitespace-nowrap text-sm text-muted-foreground">{r.duration}m</span> },
    { key: "periodNo", header: "Period", width: "w-[80px]", align: "center", sortable: true, render: (r) => <span className="text-center text-sm font-semibold text-foreground">P{r.periodNo}</span> },
    {
      key: "shift", header: "Shift", width: "w-[90px]", sortable: true, render: (r) => (
        <span className={`text-[10px] font-medium ${r.shift === "Morning" ? "text-amber-600 dark:text-amber-400" : r.shift === "Day" ? "text-blue-600 dark:text-blue-400" : "text-violet-600 dark:text-violet-400"}`}>
          {r.shift}
        </span>
      ),
    },
    { key: "status", header: "Status", width: "w-[100px]", sortable: true, render: (r) => <ClassRoutineStatusBadge status={r.status} /> },
  ];

  return (
    <PremiumDataTable
      columns={columns}
      rows={paginated}
      rowKey={(r) => r.id}
      selectable
      selectedKeys={selected}
      onSelectionChange={setSelected}
      sortField={sort.key}
      sortDir={sort.asc ? "asc" : "desc"}
      onSort={toggleSort}
      emptyIcon={CalendarClock}
      emptyTitle="No routine entries found"
      emptyDescription="No routines match the current filters."
      pagination={{ page: safePage, pageSize: PER_PAGE, total: sorted.length, onPage: setPage, itemLabel: "entries" }}
      bulkActions={(_count, clear) => (
        <>
          <Button variant="outline" size="sm" onClick={() => toast.info("Bulk export — coming soon")}>Export</Button>
          <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => toast.info("Bulk delete — coming soon")}>Delete</Button>
          <Button variant="ghost" size="sm" className="ml-auto text-muted-foreground" onClick={clear}>Deselect all</Button>
        </>
      )}
      rowActions={(r) => (
        <RowActionMenu
          entityLabel="routine entry"
          onView={() => onView(r.id)}
          onEdit={() => onEdit(r.id)}
          onDelete={() => remove.mutateAsync(r.id).then(() => toast.success("Routine entry removed"))
            .catch((e) => toast.error(errorMessage(e)))}
        />
      )}
    />
  );
}
