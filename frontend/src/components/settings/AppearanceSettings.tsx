import { useState } from "react";
import { Palette, Sun, Moon, Monitor } from "lucide-react";
import { SettingsSection, SaveBar } from "./SettingsSection";
import { DEFAULT_APPEARANCE } from "@/data/settingsData";
import type { AppearanceSettings as AS } from "@/data/settingsData";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const ACCENT_COLORS = [
  { label: "Indigo",  value: "#6366f1" },
  { label: "Blue",    value: "#3b82f6" },
  { label: "Violet",  value: "#8b5cf6" },
  { label: "Emerald", value: "#10b981" },
  { label: "Rose",    value: "#f43f5e" },
  { label: "Amber",   value: "#f59e0b" },
  { label: "Cyan",    value: "#06b6d4" },
  { label: "Slate",   value: "#64748b" },
];

type ChoiceKey = "sidebarDensity" | "tableDensity" | "animationLevel" | "cardRadius" | "fontSize";

interface ChoiceGroup {
  key:     ChoiceKey;
  label:   string;
  options: { value: string; label: string }[];
}

const CHOICE_GROUPS: ChoiceGroup[] = [
  { key: "sidebarDensity", label: "Sidebar Density",   options: [{ value:"comfortable",label:"Comfortable" },{ value:"compact",label:"Compact"      }] },
  { key: "tableDensity",   label: "Table Density",     options: [{ value:"comfortable",label:"Comfortable" },{ value:"compact",label:"Compact"      }] },
  { key: "animationLevel", label: "Animations",        options: [{ value:"full",       label:"Full"        },{ value:"reduced",label:"Reduced"      },{ value:"none",label:"None"   }] },
  { key: "cardRadius",     label: "Card Radius",       options: [{ value:"small",      label:"Small"       },{ value:"medium", label:"Medium"       },{ value:"large",label:"Large" }] },
  { key: "fontSize",       label: "Interface Font Size",options:[{ value:"small",      label:"Small"       },{ value:"default",label:"Default"      },{ value:"large",label:"Large" }] },
];

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const [s, setS] = useState<AS>({ ...DEFAULT_APPEARANCE });
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  function set<K extends keyof AS>(k: K, v: AS[K]) {
    setS((p) => ({ ...p, [k]: v }));
  }

  async function handleSave() {
    setSaving(true); setSaved(false);
    await new Promise((r) => setTimeout(r, 600));
    console.log("Appearance saved:", { theme, ...s });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-5">
      {/* Theme mode */}
      <SettingsSection icon={Palette} title="Theme Mode" subtitle="Light, dark, or follow system preference">
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: "light",  label: "Light",  Icon: Sun     },
            { value: "dark",   label: "Dark",   Icon: Moon    },
            { value: "system", label: "System", Icon: Monitor },
          ].map(({ value, label, Icon }) => (
            <button
              key={value}
              onClick={() => setTheme(value as "light" | "dark" | "system")}
              className={cn(
                "flex flex-col items-center gap-3 rounded-2xl border-2 p-5 transition-all",
                theme === value ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
              )}
            >
              <Icon className={cn("h-6 w-6", theme === value ? "text-primary" : "text-muted-foreground")} />
              <p className={cn("text-[13px] font-medium", theme === value ? "text-primary" : "text-foreground")}>{label}</p>
            </button>
          ))}
        </div>
      </SettingsSection>

      {/* Accent color */}
      <SettingsSection icon={Palette} title="Accent Color" subtitle="Primary color used throughout the interface">
        <div className="flex flex-wrap gap-3">
          {ACCENT_COLORS.map(({ label, value }) => (
            <button
              key={value}
              title={label}
              onClick={() => set("accentColor", value)}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border-4 transition-all",
                s.accentColor === value ? "border-foreground scale-110" : "border-transparent hover:scale-105",
              )}
              style={{ backgroundColor: value }}
            >
              {s.accentColor === value && (
                <span className="h-3 w-3 rounded-full border-2 border-white" />
              )}
            </button>
          ))}
        </div>
      </SettingsSection>

      {/* Choice groups */}
      <SettingsSection icon={Palette} title="Interface Preferences" subtitle="Layout density, animations, and visual style">
        <div className="space-y-5">
          {CHOICE_GROUPS.map(({ key, label, options }) => (
            <div key={key}>
              <p className="mb-2 text-[12px] font-medium text-foreground">{label}</p>
              <div className="flex flex-wrap gap-2">
                {options.map(({ value, label: optLabel }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => set(key, value as AS[ChoiceKey])}
                    className={cn(
                      "h-8 rounded-lg border px-4 text-[12px] font-medium transition-colors",
                      s[key] === value
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {optLabel}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SettingsSection>

      <SaveBar onSave={handleSave} onReset={() => setS({ ...DEFAULT_APPEARANCE })} saving={saving} saved={saved} />
    </div>
  );
}
