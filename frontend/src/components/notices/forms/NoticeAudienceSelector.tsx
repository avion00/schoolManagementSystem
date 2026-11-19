import { Users } from "lucide-react";
import { NOTICE_AUDIENCE_OPTIONS } from "@/api/types/notices";
import { useAcademicOptions } from "@/api/students";

interface Props {
  audience:       string;
  targetClasses:  string[];
  targetSections: string[];
  onAudienceChange:       (v: string) => void;
  onTargetClassesChange:  (v: string[]) => void;
  onTargetSectionsChange: (v: string[]) => void;
  audienceError?: string;
}

function MultiSelect({ label, options, selected, onChange }: {
  label: string; options: { value: string; label: string }[]; selected: string[]; onChange: (v: string[]) => void;
}) {
  function toggle(v: string) {
    onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);
  }
  return (
    <div>
      <p className="text-[11px] font-medium text-foreground mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.length === 0 && <p className="text-[11px] text-muted-foreground">None available.</p>}
        {options.map((o) => (
          <button key={o.value} type="button" onClick={() => toggle(o.value)}
            className={`h-7 rounded-full border px-3 text-[11px] font-medium transition-colors
              ${selected.includes(o.value)
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:bg-muted"}`}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function NoticeAudienceSelector({
  audience, targetClasses, targetSections,
  onAudienceChange, onTargetClassesChange, onTargetSectionsChange,
  audienceError,
}: Props) {
  // Class/section targeting narrows students, parents (by child) and teachers (by what they teach).
  const showClassFilter = audience !== "Staff";
  const academics = useAcademicOptions();
  const classOptions = (academics.data?.classes ?? []).map((c) => ({ value: c.id, label: c.name }));
  const sectionOptions = (academics.data?.sections ?? [])
    .filter((sct) => targetClasses.length === 0 || targetClasses.includes(sct.classId))
    .map((sct) => ({ value: sct.id, label: `${sct.className} ${sct.name}` }));

  return (
    <div className="space-y-5">
      {/* Audience type */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          <label className="text-[12px] font-medium text-foreground">
            Audience Type<span className="ml-0.5 text-rose-500">*</span>
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          {NOTICE_AUDIENCE_OPTIONS.map((a) => (
            <button key={a} type="button" onClick={() => onAudienceChange(a)}
              className={`h-8 rounded-lg border px-3 text-[12px] font-medium transition-colors
                ${audience === a
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:bg-muted"}`}>
              {a}
            </button>
          ))}
        </div>
        {audienceError && <p className="mt-1 text-[11px] text-rose-500">{audienceError}</p>}
      </div>

      {/* Class + section filter */}
      {showClassFilter && (
        <>
          <MultiSelect
            label="Target Classes (leave empty = all classes)"
            options={classOptions}
            selected={targetClasses}
            onChange={(v) => {
              onTargetClassesChange(v);
              // Drop sections that no longer belong to a chosen class.
              const allowed = new Set((academics.data?.sections ?? []).filter((x) => v.length === 0 || v.includes(x.classId)).map((x) => x.id));
              onTargetSectionsChange(targetSections.filter((id) => allowed.has(id)));
            }}
          />
          <MultiSelect
            label="Target Sections (leave empty = all sections)"
            options={sectionOptions}
            selected={targetSections}
            onChange={onTargetSectionsChange}
          />
          {audience === "All" && (
            <p className="text-[11px] text-muted-foreground">With "All", class filters apply to students, parents and teachers; other staff always receive it.</p>
          )}
        </>
      )}

    </div>
  );
}
