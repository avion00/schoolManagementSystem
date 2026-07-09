import { useState } from "react";
import { Bell } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  NOTIFICATION_CHANNELS, NOTIFICATION_PREF_CATEGORIES, defaultNotificationPrefs,
} from "@/data/accountData";
import { cn } from "@/lib/utils";

export function NotificationPreferencesCard() {
  const [prefs, setPrefs] = useState(defaultNotificationPrefs());

  function toggle(category: (typeof NOTIFICATION_PREF_CATEGORIES)[number], channel: (typeof NOTIFICATION_CHANNELS)[number]) {
    setPrefs((p) => ({ ...p, [category]: { ...p[category], [channel]: !p[category][channel] } }));
  }

  function save() {
    console.log("Notification preferences saved:", prefs);
    toast.success("Notification preferences saved.");
  }

  return (
    <Card className="rounded-2xl border-border/60 shadow-sm">
      <CardHeader><CardTitle className="flex items-center gap-1.5 text-[13px] font-semibold"><Bell className="h-4 w-4 text-muted-foreground" /> Notification Preferences</CardTitle></CardHeader>
      <CardContent className="pt-0">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-border/50">
                <th className="py-2 text-left font-medium text-muted-foreground">Category</th>
                {NOTIFICATION_CHANNELS.map((ch) => (
                  <th key={ch} className="py-2 text-center font-medium text-muted-foreground">{ch}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {NOTIFICATION_PREF_CATEGORIES.map((cat) => (
                <tr key={cat} className="border-b border-border/30 last:border-0">
                  <td className="py-2 font-medium text-foreground">{cat}</td>
                  {NOTIFICATION_CHANNELS.map((ch) => {
                    const isSms = ch === "SMS";
                    const value = prefs[cat][ch];
                    return (
                      <td key={ch} className="py-2 text-center">
                        <button
                          type="button"
                          disabled={isSms}
                          onClick={() => toggle(cat, ch)}
                          title={isSms ? "SMS channel is a placeholder for now" : undefined}
                          className={cn(
                            "relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors",
                            isSms ? "cursor-not-allowed opacity-40" : "cursor-pointer",
                            value ? "bg-primary" : "bg-muted",
                          )}
                        >
                          <span className={cn("pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform", value ? "translate-x-4" : "translate-x-0")} />
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-end">
          <Button size="sm" className="h-9 text-[12px]" onClick={save}>Save Notification Preferences</Button>
        </div>
      </CardContent>
    </Card>
  );
}
