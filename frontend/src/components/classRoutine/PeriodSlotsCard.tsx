import { useState } from "react";
import { Clock, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { errorMessage } from "@/api/http";
import { useRoutineData, useSlotActions } from "@/api/routine";
import { SHIFT_OPTIONS, type Shift } from "@/api/types/routine";
import { Button } from "@/components/ui/button";
import { DetailCard } from "@/components/ui/DetailCard";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";

/** The bell schedule: period slots per shift that routine entries are placed in. */
export function PeriodSlotsCard() {
  const { routine } = useRoutineData();
  const actions = useSlotActions();
  const { hasPermission } = useAuth();
  const canManage = hasPermission("timetable.manage");
  const [shift, setShift] = useState<Shift>("Day");
  const [draft, setDraft] = useState({ period_no: "", start_time: "", end_time: "", is_break: false, label: "" });
  const periods = routine.periodsFor(shift);

  async function add() {
    try {
      await actions.add.mutateAsync({ ...draft, shift: shift.toLowerCase(), period_no: Number(draft.period_no) });
      setDraft({ period_no: "", start_time: "", end_time: "", is_break: false, label: "" });
      toast.success("Period added");
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  return (
    <DetailCard icon={Clock} title="Bell Schedule"
      action={
        <select value={shift} onChange={(e) => setShift(e.target.value as Shift)}
          className="h-8 rounded-md border border-input bg-background px-2 text-[12px]">
          {SHIFT_OPTIONS.map((s) => <option key={s} value={s}>{s} shift</option>)}
        </select>
      }>
      <div className="space-y-2">
        {periods.length === 0 && <p className="text-[12px] text-muted-foreground">No periods defined for this shift.</p>}
        {periods.map((p) => (
          <div key={p.id} className="flex items-center gap-3 rounded-lg border border-border/60 px-3 py-2 text-[12.5px]">
            <span className="w-10 font-bold text-muted-foreground">P{p.period}</span>
            <span className="w-40">{p.start} – {p.end}</span>
            <span className="text-muted-foreground">{p.duration} min{p.isBreak ? " · Break" : ""}</span>
            {canManage && (
              <Button type="button" variant="ghost" size="sm" className="ml-auto text-rose-600"
                onClick={() => actions.remove.mutateAsync(p.id).catch((e) => toast.error(errorMessage(e)))}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        ))}
        {canManage && (
          <div className="grid gap-2 rounded-lg border border-dashed border-border/70 p-3 sm:grid-cols-5">
            <Input type="number" min="1" placeholder="Period #" value={draft.period_no}
              onChange={(e) => setDraft({ ...draft, period_no: e.target.value })} />
            <Input type="time" value={draft.start_time} onChange={(e) => setDraft({ ...draft, start_time: e.target.value })} />
            <Input type="time" value={draft.end_time} onChange={(e) => setDraft({ ...draft, end_time: e.target.value })} />
            <label className="flex items-center gap-2 text-[12px] text-muted-foreground">
              <input type="checkbox" checked={draft.is_break} onChange={(e) => setDraft({ ...draft, is_break: e.target.checked })} />
              Break
            </label>
            <Button type="button" size="sm" className="gap-1.5" onClick={add}
              disabled={!draft.period_no || !draft.start_time || !draft.end_time || actions.add.isPending}>
              <Plus className="h-3.5 w-3.5" />Add period
            </Button>
          </div>
        )}
      </div>
    </DetailCard>
  );
}
