import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type Row,
  type RowSelectionState,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Columns3,
  GripVertical,
  Loader,
  MoreVertical,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SlidingTabs } from "@/components/motion";
import { listStudentsForTable, type Student } from "@/lib/students";
import { cn } from "@/lib/utils";

const STATUS: Record<string, { variant: BadgeProps["variant"]; icon: typeof Loader }> = {
  active: { variant: "success", icon: CheckCircle2 },
  graduated: { variant: "secondary", icon: CheckCircle2 },
  suspended: { variant: "warning", icon: Loader },
  transferred: { variant: "secondary", icon: Loader },
  left: { variant: "secondary", icon: Loader },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS[status] ?? { variant: "secondary" as const, icon: Loader };
  const Icon = cfg.icon;
  return (
    <Badge variant={cfg.variant} className="gap-1 capitalize">
      <Icon className="h-3 w-3" />
      {status}
    </Badge>
  );
}

// Pass the active row's drag listeners to the grip cell.
const DragCtx = createContext<{ attributes: object; listeners: object | undefined }>({
  attributes: {},
  listeners: {},
});

function DragHandleCell() {
  const { attributes, listeners } = useContext(DragCtx);
  return (
    <button
      {...attributes}
      {...listeners}
      className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent active:cursor-grabbing"
      aria-label="Drag to reorder"
    >
      <GripVertical className="size-3.5" />
    </button>
  );
}

const columns: ColumnDef<Student>[] = [
  {
    id: "drag",
    header: () => null,
    cell: () => <DragHandleCell />,
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected()
            ? true
            : table.getIsSomePageRowsSelected()
              ? "indeterminate"
              : false
        }
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(v) => row.toggleSelected(!!v)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "name",
    accessorKey: "full_name",
    header: "Name",
    cell: ({ row }) => <span className="font-medium">{row.original.full_name}</span>,
    enableHiding: false,
  },
  {
    id: "admission",
    accessorKey: "admission_number",
    header: "Admission #",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.original.admission_number}
      </span>
    ),
  },
  {
    id: "class",
    accessorKey: "class_level_name",
    header: "Class",
    cell: ({ row }) => row.original.class_level_name ?? "—",
  },
  {
    id: "section",
    accessorKey: "section_name",
    header: "Section",
    cell: ({ row }) => row.original.section_name ?? "—",
  },
  {
    id: "roll",
    accessorKey: "roll_number",
    header: "Roll",
    cell: ({ row }) => row.original.roll_number || "—",
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "actions",
    header: () => null,
    enableHiding: false,
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-7 text-muted-foreground">
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36">
          <DropdownMenuItem onClick={() => toast.info(`Open ${row.original.full_name}`)}>
            View
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => toast.info("Edit — coming soon")}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => toast.info("Archive — coming soon")}
          >
            Archive
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

function DraggableRow({ row }: { row: Row<Student> }) {
  const { setNodeRef, transform, transition, isDragging, attributes, listeners } =
    useSortable({ id: row.original.id });
  return (
    <DragCtx.Provider value={{ attributes, listeners }}>
      <TableRow
        ref={setNodeRef}
        data-dragging={isDragging}
        className={cn("relative", isDragging && "z-10 bg-muted/60")}
        style={{ transform: CSS.Transform.toString(transform), transition }}
      >
        {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id} className="py-2">
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
    </DragCtx.Provider>
  );
}

const COLUMN_LABELS: Record<string, string> = {
  admission: "Admission #",
  class: "Class",
  section: "Section",
  roll: "Roll",
  status: "Status",
};

export function StudentsDataTable() {
  const [tab, setTab] = useState("all");
  const query = useQuery({
    queryKey: ["students-table", tab],
    queryFn: () => listStudentsForTable(tab === "all" ? undefined : tab),
    placeholderData: keepPreviousData,
  });

  const [data, setData] = useState<Student[]>([]);
  useEffect(() => {
    if (query.data) setData(query.data);
  }, [query.data]);

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const dataIds = useMemo<UniqueIdentifier[]>(() => data.map((s) => s.id), [data]);
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor),
  );

  const table = useReactTable({
    data,
    columns,
    state: { rowSelection, columnVisibility },
    getRowId: (r) => r.id,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 8 } },
  });

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setData((rows) => {
        const oldIndex = rows.findIndex((r) => r.id === active.id);
        const newIndex = rows.findIndex((r) => r.id === over.id);
        return arrayMove(rows, oldIndex, newIndex);
      });
    }
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SlidingTabs
          value={tab}
          onValueChange={setTab}
          options={[
            { value: "all", label: "All" },
            { value: "active", label: "Active" },
            { value: "suspended", label: "Suspended" },
            { value: "graduated", label: "Graduated" },
          ]}
        />
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Columns3 className="size-4" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter((c) => c.getCanHide())
                .map((c) => (
                  <DropdownMenuItem
                    key={c.id}
                    onSelect={(e) => {
                      e.preventDefault();
                      c.toggleVisibility(!c.getIsVisible());
                    }}
                  >
                    <Checkbox checked={c.getIsVisible()} className="mr-2" />
                    {COLUMN_LABELS[c.id] ?? c.id}
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" onClick={() => toast.info("Use the Students page to add students")}>
            <Plus className="size-4" />
            Add
          </Button>
        </div>
      </div>

      <div className="mt-4">
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={onDragEnd}
          >
            <Table>
              <TableHeader className="bg-muted/50">
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id}>
                    {hg.headers.map((h) => (
                      <TableHead key={h.id} className="h-10">
                        {h.isPlaceholder
                          ? null
                          : flexRender(h.column.columnDef.header, h.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length ? (
                  <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                      {query.isLoading ? "Loading…" : "No students."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-2 py-3">
          <span className="text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
