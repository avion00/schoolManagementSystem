import {
  ClipboardX, HelpCircle, KeyRound, MessageCircle, ReceiptText, ScrollText, UserCog,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/PremiumCard";
import type { HelpRequestType } from "@/data/studentDashboardData";

interface QuickHelp { id: string; label: string; description: string; category: HelpRequestType; sentTo: string; icon: LucideIcon; }

const QUICK_HELP: QuickHelp[] = [
  { id: "submit", label: "Cannot submit homework", description: "Upload or submission button isn't working", category: "Technical", sentTo: "IT Support", icon: ClipboardX },
  { id: "attendance", label: "Attendance issue", description: "A wrong attendance mark needs correction", category: "Attendance", sentTo: "Class Teacher", icon: UserCog },
  { id: "result", label: "Result question", description: "Ask about marks or a published result", category: "Result", sentTo: "Class Teacher", icon: ScrollText },
  { id: "fee", label: "Fee question", description: "Question about fee amount or payment", category: "Fee", sentTo: "Accounts Office", icon: ReceiptText },
  { id: "login", label: "Login issue", description: "Can't sign in or need a password reset", category: "Login", sentTo: "IT Support", icon: KeyRound },
  { id: "message", label: "Message teacher", description: "Ask your teacher something directly", category: "Message Teacher", sentTo: "Class Teacher", icon: MessageCircle },
  { id: "other", label: "Other problem", description: "Something else you need help with", category: "Other", sentTo: "Admin Office", icon: HelpCircle },
];

export function StudentHelpCards({ onCreate }: { onCreate: (help: QuickHelp) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {QUICK_HELP.map((help) => {
        const Icon = help.icon;
        return (
          <PremiumCard key={help.id} hoverable className="flex flex-col gap-3 p-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-[18px] w-[18px]" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-foreground">{help.label}</p>
              <p className="mt-0.5 text-[11.5px] text-muted-foreground">{help.description}</p>
            </div>
            <Button size="sm" variant="outline" className="h-8 w-full text-[12px]" onClick={() => onCreate(help)}>
              {help.category === "Message Teacher" ? "Message" : "Get help"}
            </Button>
          </PremiumCard>
        );
      })}
    </div>
  );
}
