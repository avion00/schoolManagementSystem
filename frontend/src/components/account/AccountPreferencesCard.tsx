import { useState } from "react";
import { Monitor, Moon, Settings2, Sun } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DEFAULT_ACCOUNT_PREFERENCES } from "@/data/accountData";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const selectClass = "h-9 w-full rounded-lg border border-input bg-background px-3 text-[12px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring";

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-[12.5px] text-foreground">{label}</span>
      <button type="button" onClick={() => onChange(!value)}
        className={cn("relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors", value ? "bg-primary" : "bg-muted")}>
        <span className={cn("pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform", value ? "translate-x-4" : "translate-x-0")} />
      </button>
    </div>
  );
}

export function AccountPreferencesCard() {
  const { theme, setTheme } = useTheme();
  const [prefs, setPrefs] = useState({ ...DEFAULT_ACCOUNT_PREFERENCES });

  function set<K extends keyof typeof prefs>(key: K, value: (typeof prefs)[K]) {
    setPrefs((p) => ({ ...p, [key]: value }));
  }

  function save() {
    console.log("Preferences saved:", { theme, ...prefs });
    toast.success("Preferences saved.");
  }

  return (
    <Card className="rounded-2xl border-border/60 shadow-sm">
      <CardHeader><CardTitle className="flex items-center gap-1.5 text-[13px] font-semibold"><Settings2 className="h-4 w-4 text-muted-foreground" /> Preferences</CardTitle></CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div>
          <label className="text-[12px] font-medium text-foreground">Theme</label>
          <div className="mt-1.5 flex gap-2">
            {([["light", Sun], ["dark", Moon], ["system", Monitor]] as const).map(([value, Icon]) => (
              <button key={value} type="button" onClick={() => setTheme(value)}
                className={cn("flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border text-[12px] font-medium capitalize transition-colors",
                  theme === value ? "border-primary bg-primary/10 text-primary" : "border-input text-muted-foreground hover:bg-muted")}>
                <Icon className="h-3.5 w-3.5" /> {value}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="text-[12px] font-medium text-foreground">Language</label>
            <select value={prefs.language} onChange={(e) => set("language", e.target.value)} className={cn(selectClass, "mt-1.5")}>
              <option>English</option><option>Nepali</option><option>Hindi</option>
            </select>
          </div>
          <div>
            <label className="text-[12px] font-medium text-foreground">Timezone</label>
            <select value={prefs.timezone} onChange={(e) => set("timezone", e.target.value)} className={cn(selectClass, "mt-1.5")}>
              <option>Asia/Kathmandu (UTC+05:45)</option><option>Asia/Kolkata (UTC+05:30)</option><option>UTC</option>
            </select>
          </div>
          <div>
            <label className="text-[12px] font-medium text-foreground">Date Format</label>
            <select value={prefs.dateFormat} onChange={(e) => set("dateFormat", e.target.value)} className={cn(selectClass, "mt-1.5")}>
              <option>YYYY-MM-DD</option><option>MM/DD/YYYY</option><option>DD/MM/YYYY</option>
            </select>
          </div>
          <div>
            <label className="text-[12px] font-medium text-foreground">Currency</label>
            <select value={prefs.currency} onChange={(e) => set("currency", e.target.value)} className={cn(selectClass, "mt-1.5")}>
              <option>USD</option><option>NPR</option><option>INR</option>
            </select>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 p-3">
          <Toggle label="Daily email summary" value={prefs.emailSummary} onChange={(v) => set("emailSummary", v)} />
          <Toggle label="Compact layout mode" value={prefs.compactMode} onChange={(v) => set("compactMode", v)} />
          <Toggle label="Collapse sidebar by default" value={prefs.sidebarCollapsedByDefault} onChange={(v) => set("sidebarCollapsedByDefault", v)} />
        </div>

        <div className="flex justify-end">
          <Button size="sm" className="h-9 text-[12px]" onClick={save}>Save Preferences</Button>
        </div>
      </CardContent>
    </Card>
  );
}
