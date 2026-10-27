import { useState } from "react";
import { CalendarDays, CheckCircle2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PremiumSkeleton } from "@/components/ui/PremiumSkeleton";
import { SettingsSection, SettingsField } from "./SettingsSection";
import { useSchools } from "@/api/classes";
import { errorMessage } from "@/api/http";
import { useAcademicYears } from "@/api/settings";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

/** Academic years: the current one scopes classes, fees, exams and attendance. */
export function AcademicYearSettings() {
  const { query, create, update, remove } = useAcademicYears();
  const school = useSchools().data;
  const { hasPermission } = useAuth();
  const canEdit = hasPermission("academics.manage");
  const [form, setForm] = useState({ name: "", start: "", end: "" });
  const [error, setError] = useState<string | null>(null);
  const fail = (e: unknown) => toast.error(errorMessage(e));
  const years = query.data ?? [];
  const today = new Date().toISOString().slice(0, 10);

  function add() {
    if (!form.name.trim() || !form.start || !form.end) { setError("Name, start and end dates are required."); return; }
    if (form.end <= form.start) { setError("The end date must be after the start date."); return; }
    if (!school?.id) { setError("School profile not loaded yet."); return; }
    setError(null);
    create.mutate({ school: school.id, name: form.name.trim(), start_date: form.start, end_date: form.end, is_current: years.length === 0 }, {
      onSuccess: () => { setForm({ name: "", start: "", end: "" }); toast.success("Academic year added."); }, onError: fail,
    });
  }

  if (query.isLoading) return <PremiumSkeleton className="h-72 w-full rounded-2xl" />;

  return (
    <div className="space-y-5">
      <SettingsSection icon={CalendarDays} title="Academic Years" subtitle="The current year is used for classes, fees, exams and attendance" noPad>
        <div className="divide-y divide-border/50">
          {years.length === 0 && <p className="p-5 text-[12.5px] text-muted-foreground">No academic years yet. Add the current one below.</p>}
          {years.map((y) => {
            const status = y.is_current ? "Current" : (y.start_date ?? "") > today ? "Upcoming" : "Past";
            return (
              <div key={y.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-foreground">{y.name}</p>
                  <p className="text-[11.5px] text-muted-foreground">{y.start_date} → {y.end_date}</p>
                </div>
                <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                  status === "Current" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                    : status === "Upcoming" ? "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300" : "bg-muted text-muted-foreground")}>
                  {status}
                </span>
                {canEdit && !y.is_current && (<>
                  <Button size="sm" variant="outline" className="h-7 gap-1 text-[11.5px]"
                    onClick={() => window.confirm(`Make ${y.name} the current academic year?`) && update.mutate({ id: y.id, body: { is_current: true } }, {
                      onSuccess: () => toast.success(`${y.name} is now the current year.`), onError: fail })}>
                    <CheckCircle2 className="h-3.5 w-3.5" /> Set current
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-rose-600"
                    onClick={() => window.confirm(`Delete ${y.name}? Years with classes, students or fees can't be deleted.`) && remove.mutate(y.id, {
                      onSuccess: () => toast.success("Academic year deleted."), onError: fail })}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </>)}
              </div>
            );
          })}
        </div>
      </SettingsSection>

      {canEdit && (
        <SettingsSection icon={Plus} title="Add Academic Year">
          <div className="grid gap-4 sm:grid-cols-3">
            <SettingsField label="Name" required><Input value={form.name} placeholder="e.g. 2083/84" onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-9 text-[13px]" /></SettingsField>
            <SettingsField label="Starts" required><Input type="date" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} className="h-9 text-[13px]" /></SettingsField>
            <SettingsField label="Ends" required><Input type="date" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} className="h-9 text-[13px]" /></SettingsField>
          </div>
          {error && <p className="mt-2 text-[11.5px] text-rose-600">{error}</p>}
          <Button size="sm" className="mt-4 h-8 gap-1.5 text-[12px]" disabled={create.isPending} onClick={add}>
            <Plus className="h-3.5 w-3.5" /> {create.isPending ? "Adding…" : "Add Year"}
          </Button>
        </SettingsSection>
      )}
    </div>
  );
}
