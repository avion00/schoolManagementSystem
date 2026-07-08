import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { CreateTicketForm, type NewTicketFormData } from "@/components/helpdesk/CreateTicketModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createTicketFromForm } from "@/data/helpDeskData";

export function HelpTicketCreatePage() {
  const navigate = useNavigate();

  function handleCreate(data: NewTicketFormData) {
    const ticket = createTicketFromForm(data);
    console.log("Created ticket:", ticket);
    toast.success(`${ticket.ticketId} created successfully.`);
    navigate("/help");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-[12.5px]" onClick={() => navigate("/help")}>
        <ChevronLeft className="h-3.5 w-3.5" /> Back to Help Desk
      </Button>

      <Card className="rounded-2xl border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">New Support Ticket</CardTitle>
          <CardDescription>Manually log a support request on behalf of a student, parent, teacher, or staff member.</CardDescription>
        </CardHeader>
        <CardContent>
          <CreateTicketForm submitLabel="Create Ticket" onCreate={handleCreate} />
        </CardContent>
      </Card>
    </div>
  );
}
