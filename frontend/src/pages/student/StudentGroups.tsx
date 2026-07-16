import { FolderOpen, MessageSquare, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Reveal } from "@/components/motion";
import { PremiumBadge } from "@/components/ui/PremiumBadge";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { Button } from "@/components/ui/button";
import { classGroups } from "@/data/studentDashboardData";

export function StudentGroups() {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <Reveal>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Class Groups</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">Collaborate safely with your class and study groups.</p>
      </Reveal>

      <Reveal delay={60} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {classGroups.map((g) => (
          <PremiumCard key={g.id} className="flex flex-col gap-3 p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
                <Users className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-foreground">{g.name}</p>
                <p className="truncate text-[11.5px] text-muted-foreground">{g.membersCount} members · Moderated by {g.moderator}</p>
              </div>
              {g.unreadCount > 0 && <PremiumBadge label={String(g.unreadCount)} tone="info" />}
            </div>
            <p className="text-[11.5px] text-muted-foreground">Last activity: {g.lastActivity} · {g.materialsCount} shared materials</p>
            <div className="mt-auto flex gap-2 border-t border-border/60 pt-3">
              <Button
                size="sm"
                variant="outline"
                className="h-8 flex-1 gap-1.5 text-[12px]"
                onClick={() => (g.conversationId ? navigate(`/student/messages/${g.conversationId}`) : toast.info("This group doesn't have a live chat yet."))}
              >
                <MessageSquare className="h-3.5 w-3.5" /> Open group
              </Button>
              <Button size="sm" variant="ghost" className="h-8 flex-1 gap-1.5 text-[12px]" onClick={() => navigate("/student/materials")}>
                <FolderOpen className="h-3.5 w-3.5" /> Materials
              </Button>
            </div>
          </PremiumCard>
        ))}
      </Reveal>
    </div>
  );
}
