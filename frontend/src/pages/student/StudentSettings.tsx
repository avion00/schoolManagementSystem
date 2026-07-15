import { Monitor, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Reveal } from "@/components/motion";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { PremiumSelect } from "@/components/ui/PremiumSelect";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", checked ? "bg-primary" : "bg-muted")}
    >
      <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform", checked ? "translate-x-5" : "translate-x-0.5")} />
    </button>
  );
}

export function StudentSettings() {
  const { theme, setTheme } = useTheme();
  const [notifyHomework, setNotifyHomework] = useState(true);
  const [notifyMessages, setNotifyMessages] = useState(true);
  const [notifyNotices, setNotifyNotices] = useState(true);
  const [language, setLanguage] = useState("en");
  const [profileVisible, setProfileVisible] = useState(true);

  return (
    <div className="space-y-4">
      <Reveal>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">Manage your notification, theme, and privacy preferences.</p>
      </Reveal>

      <Reveal delay={40}>
        <PremiumCard className="p-5">
          <p className="mb-3 text-[13px] font-semibold text-foreground">Appearance</p>
          <div className="flex gap-2">
            {THEME_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTheme(opt.value)}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-[12px] font-medium transition-colors",
                    theme === opt.value ? "border-primary bg-primary/5 text-primary" : "border-border/60 text-muted-foreground hover:bg-accent/40",
                  )}
                >
                  <Icon className="h-4 w-4" /> {opt.label}
                </button>
              );
            })}
          </div>
        </PremiumCard>
      </Reveal>

      <Reveal delay={80}>
        <PremiumCard className="p-5">
          <p className="mb-3 text-[13px] font-semibold text-foreground">Notifications</p>
          <div className="space-y-3">
            {[
              { label: "Homework & assignment reminders", checked: notifyHomework, set: setNotifyHomework },
              { label: "New messages", checked: notifyMessages, set: setNotifyMessages },
              { label: "School notices", checked: notifyNotices, set: setNotifyNotices },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between">
                <span className="text-[12.5px] text-foreground">{row.label}</span>
                <Toggle checked={row.checked} onChange={(v) => { row.set(v); toast.success(`${row.label} ${v ? "enabled" : "disabled"}.`); }} />
              </div>
            ))}
          </div>
        </PremiumCard>
      </Reveal>

      <Reveal delay={120} className="grid gap-4 sm:grid-cols-2">
        <PremiumCard className="p-5">
          <p className="mb-3 text-[13px] font-semibold text-foreground">Language</p>
          <PremiumSelect value={language} onChange={setLanguage} options={[{ value: "en", label: "English" }, { value: "ne", label: "नेपाली" }]} />
        </PremiumCard>

        <PremiumCard className="p-5">
          <p className="mb-3 text-[13px] font-semibold text-foreground">Privacy</p>
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] text-foreground">Show my profile to classmates</span>
            <Toggle checked={profileVisible} onChange={setProfileVisible} />
          </div>
        </PremiumCard>
      </Reveal>

      <Reveal delay={160}>
        <PremiumCard className="p-5">
          <p className="mb-3 text-[13px] font-semibold text-foreground">Active sessions</p>
          <div className="flex items-center justify-between rounded-xl border border-border/60 px-3 py-2.5 text-[12.5px]">
            <span className="text-foreground">This device · Current session</span>
            <span className="text-muted-foreground">Active now</span>
          </div>
        </PremiumCard>
      </Reveal>
    </div>
  );
}
