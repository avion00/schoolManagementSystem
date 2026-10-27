import { Monitor, Moon, Palette, Sun } from "lucide-react";
import { SettingsSection } from "./SettingsSection";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

/** Light / dark / system theme. Applies instantly and is remembered on this device. */
export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="space-y-5">
      <SettingsSection icon={Palette} title="Theme Mode" subtitle="Applies straight away and is remembered on this device">
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
    </div>
  );
}
