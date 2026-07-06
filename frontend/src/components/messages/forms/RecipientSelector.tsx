import { Users } from "lucide-react";
import {
  RECIPIENT_TYPE_OPTIONS, CLASS_OPTIONS_MESSAGES, SECTION_OPTIONS_MESSAGES,
} from "@/data/messagesData";

const SPECIFIC_NAMES: Record<string, string[]> = {
  "Specific Student": [
    "Aarav Sharma (Grade 8A)", "Priya Thapa (Grade 9B)", "Rohan Poudel (Grade 10A)",
    "Sita Maharjan (Grade 7C)", "Bikash Karki (Grade 6A)",
  ],
  "Specific Parent": [
    "Mr. Raj Sharma (Parent of Aarav)", "Mrs. Sunita Thapa (Parent of Priya)",
    "Mr. Gopal Poudel (Parent of Rohan)", "Mrs. Kamala Maharjan (Parent of Sita)",
  ],
  "Specific Teacher": [
    "Andrew Martin (Math)", "Kazi Fahim (Science)", "Sita Rai (English)",
    "Ramesh Adhikari (Social Studies)", "Sunita Gurung (Nepali)",
  ],
};

function MultiChip({ label, options, selected, onChange }: {
  label: string; options: readonly string[]; selected: string[]; onChange: (v: string[]) => void;
}) {
  function toggle(v: string) {
    onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);
  }
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-medium text-foreground">{label}</p>
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

interface Props {
  recipientType:    string;
  selectedClasses:  string[];
  selectedSections: string[];
  selectedPeople:   string[];
  onTypeChange:     (v: string)   => void;
  onClassesChange:  (v: string[]) => void;
  onSectionsChange: (v: string[]) => void;
  onPeopleChange:   (v: string[]) => void;
  typeError?:       string;
  peopleError?:     string;
}

export function RecipientSelector({
  recipientType, selectedClasses, selectedSections, selectedPeople,
  onTypeChange, onClassesChange, onSectionsChange, onPeopleChange,
  typeError, peopleError,
}: Props) {
  const showClassSection = ["Specific Class","Specific Section"].includes(recipientType);
  const specificNames = SPECIFIC_NAMES[recipientType];

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-2 flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          <label className="text-[12px] font-medium text-foreground">
            Recipient Type<span className="ml-0.5 text-rose-500">*</span>
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          {RECIPIENT_TYPE_OPTIONS.map((t) => (
            <button key={t} type="button" onClick={() => onTypeChange(t)}
              className={`h-8 rounded-lg border px-3 text-[12px] font-medium transition-colors
                ${recipientType === t
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:bg-muted"}`}>
              {t}
            </button>
          ))}
        </div>
        {typeError && <p className="mt-1 text-[11px] text-rose-500">{typeError}</p>}
      </div>

      {showClassSection && (
        <>
          <MultiChip
            label="Classes (leave empty = all)"
            options={CLASS_OPTIONS_MESSAGES}
            selected={selectedClasses}
            onChange={onClassesChange}
          />
          <MultiChip
            label="Sections (leave empty = all)"
            options={SECTION_OPTIONS_MESSAGES}
            selected={selectedSections}
            onChange={onSectionsChange}
          />
        </>
      )}

      {specificNames && (
        <MultiChip
          label="Select Recipients"
          options={specificNames}
          selected={selectedPeople}
          onChange={onPeopleChange}
        />
      )}

      {peopleError && <p className="text-[11px] text-rose-500">{peopleError}</p>}
    </div>
  );
}
