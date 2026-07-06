import { Users } from "lucide-react";
import {
  NOTICE_AUDIENCE_OPTIONS, CLASS_OPTIONS_NOTICES, SECTION_OPTIONS_NOTICES,
} from "@/data/noticesData";

interface Props {
  audience:       string;
  targetClasses:  string[];
  targetSections: string[];
  sendToAll:      boolean;
  onAudienceChange:       (v: string) => void;
  onTargetClassesChange:  (v: string[]) => void;
  onTargetSectionsChange: (v: string[]) => void;
  onSendToAllChange:      (v: boolean) => void;
  audienceError?: string;
}

function MultiSelect({ label, options, selected, onChange }: {
  label: string; options: readonly string[]; selected: string[]; onChange: (v: string[]) => void;
}) {
  function toggle(v: string) {
    onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);
  }
  return (
    <div>
      <p className="text-[11px] font-medium text-foreground mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button key={o} type="button" onClick={() => toggle(o)}
            className={`h-7 rounded-full border px-3 text-[11px] font-medium transition-colors
              ${selected.includes(o)
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:bg-muted"}`}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

export function NoticeAudienceSelector({
  audience, targetClasses, targetSections, sendToAll,
  onAudienceChange, onTargetClassesChange, onTargetSectionsChange, onSendToAllChange,
  audienceError,
}: Props) {
  const showClassFilter = ["Students","Parents","Students & Parents","All"].includes(audience);

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
            options={CLASS_OPTIONS_NOTICES}
            selected={targetClasses}
            onChange={onTargetClassesChange}
          />
          <MultiSelect
            label="Target Sections (leave empty = all sections)"
            options={SECTION_OPTIONS_NOTICES}
            selected={targetSections}
            onChange={onTargetSectionsChange}
          />
        </>
      )}

      {/* Send to all toggle */}
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => onSendToAllChange(!sendToAll)}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors
            ${sendToAll ? "bg-primary" : "bg-muted"}`}>
          <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow ring-0 transition-transform
            ${sendToAll ? "translate-x-4" : "translate-x-0"}`} />
        </button>
        <span className="text-[12px] text-foreground font-medium">Send to all recipients in the selected audience</span>
      </div>
    </div>
  );
}
