import { useState } from "react";
import { Laptop2, LogOut, Monitor, Smartphone } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ACCOUNT_SESSIONS, type AccountSession } from "@/data/accountData";
import { cn } from "@/lib/utils";

function deviceIcon(device: string) {
  if (device.toLowerCase().includes("iphone") || device.toLowerCase().includes("android")) return Smartphone;
  if (device.toLowerCase().includes("laptop")) return Laptop2;
  return Monitor;
}

export function ActiveSessionsCard() {
  const [sessions, setSessions] = useState<AccountSession[]>(ACCOUNT_SESSIONS);

  function revoke(session: AccountSession) {
    setSessions((prev) => prev.filter((s) => s.id !== session.id));
    console.log("Revoked session:", session.id);
    toast.success(`Session on ${session.device} revoked.`);
  }

  function revokeAllOthers() {
    setSessions((prev) => prev.filter((s) => s.isCurrent));
    console.log("Revoked all other sessions");
    toast.success("All other sessions have been revoked.");
  }

  return (
    <Card className="rounded-2xl border-border/60 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-[13px] font-semibold">Active Sessions & Devices</CardTitle>
        <Button variant="outline" size="sm" className="h-7 gap-1.5 text-[11.5px] text-destructive hover:text-destructive"
          onClick={revokeAllOthers} disabled={sessions.length <= 1}>
          <LogOut className="h-3.5 w-3.5" /> Revoke all other sessions
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-[11px]">Device</TableHead>
              <TableHead className="text-[11px]">Browser</TableHead>
              <TableHead className="text-[11px]">Location</TableHead>
              <TableHead className="text-[11px]">IP Address</TableHead>
              <TableHead className="text-[11px]">Last Active</TableHead>
              <TableHead className="text-[11px]">Status</TableHead>
              <TableHead className="w-9 text-[11px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((s) => {
              const Icon = deviceIcon(s.device);
              return (
                <TableRow key={s.id}>
                  <TableCell>
                    <span className="flex items-center gap-2 text-[12.5px] font-medium text-foreground">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" /> {s.device}
                      {s.isCurrent && <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">This device</span>}
                    </span>
                  </TableCell>
                  <TableCell className="text-[12px] text-muted-foreground">{s.browser}</TableCell>
                  <TableCell className="text-[12px] text-muted-foreground">{s.location}</TableCell>
                  <TableCell className="font-mono text-[11.5px] text-muted-foreground">{s.ipAddress}</TableCell>
                  <TableCell className="text-[12px] text-muted-foreground">{s.lastActive}</TableCell>
                  <TableCell>
                    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium",
                      s.status === "Active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                                             : "bg-slate-200 text-slate-600 dark:bg-slate-500/20 dark:text-slate-300")}>
                      {s.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {!s.isCurrent && (
                      <Button variant="ghost" size="sm" className="h-7 text-[11.5px] text-destructive hover:text-destructive" onClick={() => revoke(s)}>
                        Revoke
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
