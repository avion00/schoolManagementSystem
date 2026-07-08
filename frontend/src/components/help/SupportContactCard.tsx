import { Clock, Mail, MessageCircle, Phone } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SUPPORT_CONTACT } from "@/data/helpData";

function ContactRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">{label}</p>
        <p className="mt-0.5 text-[13px] font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

export function SupportContactCard() {
  return (
    <Card className="rounded-2xl border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Contact Support</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ContactRow icon={Mail} label="Support Email" value={SUPPORT_CONTACT.email} />
        <ContactRow icon={Phone} label="Phone" value={SUPPORT_CONTACT.phone} />
        <ContactRow icon={Clock} label="Office Hours" value={SUPPORT_CONTACT.officeHours} />
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <MessageCircle className="h-4 w-4 text-primary" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">Response Time</p>
            <p className="mt-0.5 text-[12.5px] text-foreground">
              Normal: <span className="font-medium">{SUPPORT_CONTACT.responseNormal}</span>
            </p>
            <p className="text-[12.5px] text-foreground">
              Urgent: <span className="font-medium">{SUPPORT_CONTACT.responseUrgent}</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
