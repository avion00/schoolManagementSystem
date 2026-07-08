import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CATEGORY_OPTIONS } from "@/data/notificationsData";
import { cn } from "@/lib/utils";

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <span className="text-[12.5px] text-foreground">{label}</span>
      <button type="button" onClick={() => onChange(!value)}
        className={cn("relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors", value ? "bg-primary" : "bg-muted")}>
        <span className={cn("pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform", value ? "translate-x-4" : "translate-x-0")} />
      </button>
    </div>
  );
}

interface SettingsState {
  inApp: boolean;
  email: boolean;
  sms: boolean;
  push: boolean;
  dailySummary: boolean;
  urgentOnly: boolean;
  categories: Record<string, boolean>;
  quietStart: string;
  quietEnd: string;
  retentionDays: string;
}

function defaultSettings(): SettingsState {
  return {
    inApp: true, email: true, sms: false, push: true, dailySummary: true, urgentOnly: false,
    categories: Object.fromEntries(CATEGORY_OPTIONS.map((c) => [c, true])),
    quietStart: "22:00", quietEnd: "07:00", retentionDays: "90",
  };
}

export function NotificationSettingsPanel({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings());

  function set<K extends keyof SettingsState>(key: K, value: SettingsState[K]) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  function handleSave() {
    console.log("Notification settings saved:", settings);
    toast.success("Notification settings saved.");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Notification Settings</DialogTitle>
          <DialogDescription>Control how and when Super Admin notifications are delivered.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl border border-border/60 p-3.5">
            <p className="mb-1 text-[12.5px] font-semibold text-foreground">Delivery Channels</p>
            <Toggle label="In-app notifications" value={settings.inApp} onChange={(v) => set("inApp", v)} />
            <Toggle label="Email notifications" value={settings.email} onChange={(v) => set("email", v)} />
            <Toggle label="SMS notifications (placeholder)" value={settings.sms} onChange={(v) => set("sms", v)} />
            <Toggle label="Push notifications" value={settings.push} onChange={(v) => set("push", v)} />
          </div>

          <div className="rounded-xl border border-border/60 p-3.5">
            <p className="mb-1 text-[12.5px] font-semibold text-foreground">Delivery Preferences</p>
            <Toggle label="Daily summary email" value={settings.dailySummary} onChange={(v) => set("dailySummary", v)} />
            <Toggle label="Urgent alerts only" value={settings.urgentOnly} onChange={(v) => set("urgentOnly", v)} />
          </div>

          <div className="rounded-xl border border-border/60 p-3.5">
            <p className="mb-2 text-[12.5px] font-semibold text-foreground">Categories Enabled</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3">
              {CATEGORY_OPTIONS.map((c) => (
                <Toggle key={c} label={c} value={settings.categories[c]} onChange={(v) => set("categories", { ...settings.categories, [c]: v })} />
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border/60 p-3.5">
            <p className="mb-2 text-[12.5px] font-semibold text-foreground">Quiet Hours</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-muted-foreground">From</label>
                <input type="time" value={settings.quietStart} onChange={(e) => set("quietStart", e.target.value)}
                  className="mt-1 h-9 w-full rounded-lg border border-input bg-background px-3 text-[12px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
              <div>
                <label className="text-[11px] font-medium text-muted-foreground">To</label>
                <input type="time" value={settings.quietEnd} onChange={(e) => set("quietEnd", e.target.value)}
                  className="mt-1 h-9 w-full rounded-lg border border-input bg-background px-3 text-[12px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border/60 p-3.5">
            <label className="text-[12.5px] font-semibold text-foreground">Notification Retention (days)</label>
            <input type="number" min="1" value={settings.retentionDays} onChange={(e) => set("retentionDays", e.target.value)}
              className="mt-2 h-9 w-full rounded-lg border border-input bg-background px-3 text-[12px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
            <p className="mt-1.5 text-[11px] text-muted-foreground">Notifications older than this will be automatically archived.</p>
          </div>

          <div className="flex justify-end gap-2 border-t border-border/40 pt-4">
            <Button variant="outline" size="sm" className="h-9 text-[12px]" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button size="sm" className="h-9 text-[12px]" onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
