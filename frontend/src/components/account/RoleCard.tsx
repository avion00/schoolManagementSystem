import { ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import type { Role } from "@/lib/admin";
import { cn } from "@/lib/utils";

export function RoleCard({ role, userCount }: { role: Role; userCount: number }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/60 p-3.5">
      <div className="flex items-start justify-between gap-2">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-500/15">
          <ShieldCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        </span>
        <span className={cn("rounded-full px-2 py-0.5 text-[10.5px] font-medium",
          role.is_system ? "bg-slate-200 text-slate-600 dark:bg-slate-500/20 dark:text-slate-300"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300")}>
          {role.is_system ? "System" : "Custom"}
        </span>
      </div>
      <div>
        <p className="text-[13px] font-semibold text-foreground">{role.name}</p>
        <p className="mt-0.5 line-clamp-2 text-[11.5px] text-muted-foreground">{role.description || "No description provided."}</p>
      </div>
      <div className="flex items-center gap-4 text-[11.5px] text-muted-foreground">
        <span><span className="font-semibold text-foreground">{userCount}</span> users</span>
        <span><span className="font-semibold text-foreground">{role.permissions.length}</span> permissions</span>
      </div>
      <Button variant="outline" size="sm" className="h-7 text-[11.5px]" onClick={() => navigate("/roles")}>
        Manage
      </Button>
    </div>
  );
}
