import { Mail, MailOpen, Send, FileText, AlertCircle, Clock, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { MESSAGE_SUMMARY } from "@/data/messagesData";

const CARDS = [
  { label: "Total Messages", key: "total",     icon: Mail,         color: "text-blue-600",    bg: "bg-blue-50 dark:bg-blue-950/40"    },
  { label: "Unread",         key: "unread",    icon: MailOpen,     color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-950/40"  },
  { label: "Sent",           key: "sent",      icon: Send,         color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
  { label: "Drafts",         key: "drafts",    icon: FileText,     color: "text-neutral-600", bg: "bg-neutral-100 dark:bg-neutral-800" },
  { label: "Failed",         key: "failed",    icon: AlertCircle,  color: "text-rose-600",    bg: "bg-rose-50 dark:bg-rose-950/40"    },
  { label: "Scheduled",      key: "scheduled", icon: Clock,        color: "text-violet-600",  bg: "bg-violet-50 dark:bg-violet-950/40" },
  { label: "Starred",        key: "starred",   icon: Star,         color: "text-yellow-600",  bg: "bg-yellow-50 dark:bg-yellow-950/40" },
] as const;

export function MessageSummaryCards() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
      {CARDS.map(({ label, key, icon: Icon, color, bg }) => (
        <Card key={key} className="flex flex-col gap-3 rounded-2xl p-4 shadow-sm">
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${bg}`}>
            <Icon className={`h-4.5 w-4.5 ${color}`} style={{ width: 18, height: 18 }} />
          </div>
          <div>
            <p className="text-2xl font-bold tabular-nums text-foreground">
              {MESSAGE_SUMMARY[key]}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{label}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
