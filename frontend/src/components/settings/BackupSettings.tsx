import { DatabaseBackup, History, ShieldCheck } from "lucide-react";
import { SettingsSection } from "./SettingsSection";

/** Backups run on the server; this page explains what is protected and how to restore. */
export function BackupSettings() {
  return (
    <div className="space-y-5">
      <SettingsSection icon={DatabaseBackup} title="Automatic Backups">
        <p className="text-[12.5px] leading-relaxed text-muted-foreground">
          The whole database and all uploaded files are backed up automatically every night on the server, and older
          backups are kept on a rolling schedule. Backups are encrypted at rest and never leave the hosting provider
          unless your administrator copies them off-site.
        </p>
      </SettingsSection>
      <SettingsSection icon={History} title="Restoring">
        <p className="text-[12.5px] leading-relaxed text-muted-foreground">
          Restores are done by your system administrator from the server (see the deployment runbook). Deleted records in
          most modules are kept for audit and can be recovered without a full restore — ask your administrator.
        </p>
      </SettingsSection>
      <SettingsSection icon={ShieldCheck} title="Audit Trail">
        <p className="text-[12.5px] leading-relaxed text-muted-foreground">
          Every change to students, fees, exams, attendance and settings is recorded with who made it and when. See
          Settings → Audit Logs.
        </p>
      </SettingsSection>
    </div>
  );
}
