import { ChevronLeft, FilePlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { CreateTicketForm } from "@/components/helpdesk/CreateTicketModal";
import { Button } from "@/components/ui/button";
import { FormSection } from "@/components/ui/form-section";

export function HelpTicketCreatePage() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-[12.5px]" onClick={() => navigate("/help")}>
        <ChevronLeft className="h-3.5 w-3.5" /> Back to Help Desk
      </Button>

      <FormSection
        icon={FilePlus}
        title="New Support Ticket"
        subtitle="Log a support request on behalf of a student, parent, teacher, or staff member."
      >
        <CreateTicketForm submitLabel="Create Ticket" onCreated={(id) => navigate(`/help/tickets/${id}`)} />
      </FormSection>
    </div>
  );
}
