import { Layers, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SubjectClassMapping } from "@/data/subjectDetailData";

const SECTION_COLORS = [
  "border-l-violet-400",
  "border-l-blue-400",
  "border-l-emerald-400",
  "border-l-amber-400",
  "border-l-rose-400",
  "border-l-teal-400",
  "border-l-indigo-400",
  "border-l-pink-400",
];

const STATUS_CFG = {
  active:   "bg-emerald-50 text-emerald-700 ring-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-400",
  inactive: "bg-muted text-muted-foreground ring-border/30",
};

function Badge({ label, cls }: { label: string; cls: string }) {
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${cls}`}>{label}</span>;
}

export function SubjectClassMappingCard({ classMappings }: { classMappings: SubjectClassMapping[] }) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[14px] font-semibold flex items-center gap-2">
            <Layers className="h-4 w-4 text-muted-foreground" />
            Class Mappings
          </CardTitle>
          <span className="text-[11px] text-muted-foreground">{classMappings.length} sections</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {classMappings.map((m, i) => (
            <div key={m.id}
              className={`rounded-lg border border-border/60 border-l-4 ${SECTION_COLORS[i % SECTION_COLORS.length]} bg-card p-3 shadow-sm`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[13px] font-semibold text-foreground">
                    {m.className} — Section {m.section}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{m.teacher}</p>
                </div>
                <Badge label={m.status === "active" ? "Active" : "Inactive"} cls={STATUS_CFG[m.status]} />
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />{m.students} students
                </span>
                <span>{m.weeklyPeriods} periods/wk</span>
                <span>{m.room}</span>
              </div>
            </div>
          ))}
        </div>
        {classMappings.length === 0 && (
          <p className="py-8 text-center text-[13px] text-muted-foreground">No class mappings found.</p>
        )}
      </CardContent>
    </Card>
  );
}
