import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { PremiumSkeleton } from "@/components/ui/PremiumSkeleton";
import { SaveBar } from "./SettingsSection";
import { errorMessage } from "@/api/http";
import { useSettingsSection, type OrgSettings } from "@/api/settings";
import { useAuth } from "@/lib/auth";

/** Loads one settings section, keeps an editable draft and saves it (settings.manage only). */
export function SectionForm<K extends keyof OrgSettings>({ section, children }: {
  section: K;
  children: (draft: OrgSettings[K], set: (change: Partial<OrgSettings[K]>) => void, canEdit: boolean) => ReactNode;
}) {
  const { query, save } = useSettingsSection(section);
  const { hasPermission } = useAuth();
  const canEdit = hasPermission("settings.manage");
  const [draft, setDraft] = useState<OrgSettings[K] | null>(null);
  const [saved, setSaved] = useState(false);
  useEffect(() => { if (query.data && !draft) setDraft(query.data); }, [query.data, draft]);

  if (query.isLoading || !draft) return <PremiumSkeleton className="h-72 w-full rounded-2xl" />;
  return (
    <div className="space-y-5">
      {children(draft, (change) => setDraft((d) => (d ? { ...d, ...change } : d)), canEdit)}
      {canEdit ? (
        <SaveBar
          saving={save.isPending}
          saved={saved}
          onReset={() => setDraft(query.data ?? null)}
          onSave={() => save.mutate(draft, {
            onSuccess: (d) => { setDraft(d); setSaved(true); setTimeout(() => setSaved(false), 3000); toast.success("Settings saved."); },
            onError: (e) => toast.error(errorMessage(e)),
          })}
        />
      ) : (
        <p className="text-[12px] text-muted-foreground">Only users who can manage settings can change these.</p>
      )}
    </div>
  );
}
