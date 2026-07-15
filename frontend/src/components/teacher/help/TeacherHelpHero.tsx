import { ClipboardList, Laptop, LifeBuoy, MessageCircle, School, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Reveal } from "@/components/motion";
import { PremiumCard } from "@/components/ui/PremiumCard";
import type { HelpRequestType, SendToOption } from "@/data/teacherHelpData";

interface QuickAction {
  label: string;
  icon: LucideIcon;
  category?: HelpRequestType;
  sendTo?: SendToOption;
}

const QUICK_ACTIONS: QuickAction[] = [
  { label: "I need technical help",  icon: Laptop,       category: "Technical",       sendTo: "IT Support" },
  { label: "Report class issue",     icon: School,       category: "Class Issue",     sendTo: "Academic Coordinator" },
  { label: "Ask principal/admin",    icon: Users,        category: "Admin Approval",  sendTo: "Principal" },
  { label: "Student needs support",  icon: LifeBuoy,      category: "Student Support", sendTo: "Admin Office" },
  { label: "Parent concern",         icon: MessageCircle, category: "Parent Concern",  sendTo: "Principal" },
  { label: "View my tickets",        icon: ClipboardList },
];

export function TeacherHelpHero({
  onNewRequest,
  onViewTickets,
}: {
  onNewRequest: (category?: HelpRequestType, sendTo?: SendToOption) => void;
  onViewTickets: () => void;
}) {
  return (
    <Reveal>
      <PremiumCard className="overflow-hidden p-6 sm:p-8">
        <div className="max-w-2xl">
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">How can we help you today?</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">
            Submit a request, track your issues, or help students and parents assigned to you.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                type="button"
                onClick={() => (action.category ? onNewRequest(action.category, action.sendTo) : onViewTickets())}
                className="t-lift flex flex-col items-center gap-2 rounded-2xl border border-border/60 bg-background/60 px-3 py-4 text-center transition-colors hover:border-primary/40 hover:bg-primary/5"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="text-[12px] font-medium leading-tight text-foreground">{action.label}</span>
              </button>
            );
          })}
        </div>
      </PremiumCard>
    </Reveal>
  );
}
