import { toast } from "sonner";

import { errorMessage } from "@/api/http";
import { PRIORITY_VALUE, STATUS_VALUE, useAgents, useCreateTicket, useTicketActions, CATEGORY_VALUE } from "@/api/helpdesk";
import type { SupportTicket, TicketCategory, TicketPriority, TicketStatus } from "@/api/types/helpdesk";

/** Ticket actions shared by the help desk inbox and the ticket page; every one calls the API. */
export function useTicketHandlers(tickets: SupportTicket[]) {
  const actions = useTicketActions();
  const agents = useAgents().data ?? [];
  const create = useCreateTicket();
  const fail = (e: unknown) => toast.error(errorMessage(e));
  const find = (id: string) => tickets.find((t) => t.id === id);
  const agentByName = (name: string) => agents.find((a) => a.name === name);

  /** Moves a ticket to a status through the matching endpoint. */
  async function moveTo(t: SupportTicket, status: TicketStatus, note = "", priority?: TicketPriority) {
    if (status === "Resolved") return actions.resolve.mutateAsync({ id: t.id, note });
    if (status === "Closed") return actions.close.mutateAsync(t.id);
    if (t.status === "Resolved" || t.status === "Closed") {
      await actions.reopen.mutateAsync({ id: t.id, reason: note });
      if (status === "Open") return;
    }
    const target = status === "New" ? "open" : STATUS_VALUE[status];
    return actions.setStatus.mutateAsync({ id: t.id, status: target, priority: priority && PRIORITY_VALUE[priority], note });
  }

  return {
    agents,
    sendMessage(ticketId: string, body: string, isInternal: boolean, attachmentIds?: string[]) {
      actions.reply.mutate({ id: ticketId, body, internal: isInternal, attachmentIds }, {
        onSuccess: () => toast.success(isInternal ? "Internal note added." : "Reply sent."), onError: fail,
      });
    },
    async assignTicket(ticketId: string, assigneeName: string, _dueDate: string, priority: TicketPriority, note: string) {
      const t = find(ticketId);
      const agent = agentByName(assigneeName);
      if (!t || !agent) { toast.error("Pick someone from the help desk team."); return; }
      try {
        await actions.assign.mutateAsync({ id: ticketId, user: agent.id });
        if (priority !== t.priority) {
          const keep = t.status === "New" ? "Open" : t.status;
          await actions.setStatus.mutateAsync({ id: ticketId, status: STATUS_VALUE[keep], priority: PRIORITY_VALUE[priority] });
        }
        if (note.trim()) await actions.reply.mutateAsync({ id: ticketId, body: note.trim(), internal: true });
        toast.success(`Assigned to ${agent.name}.`);
      } catch (e) { fail(e); }
    },
    statusChange(ticketId: string, status: TicketStatus, resolution?: { summary: string; category?: string }) {
      const t = find(ticketId);
      if (!t) return;
      moveTo(t, status, resolution?.summary ?? "")
        .then(() => toast.success(`Status changed to ${status}.`)).catch(fail);
    },
    escalateTicket(ticketId: string, target: string, reason: string, _dueDate: string, markUrgent: boolean) {
      const t = find(ticketId);
      if (!t) return;
      moveTo(t, "Escalated", [target && `To ${target}`, reason].filter(Boolean).join(": "), markUrgent ? "Urgent" : undefined)
        .then(() => toast.success("Ticket escalated.")).catch(fail);
    },
    quickAction(t: SupportTicket, action: "escalate" | "close") {
      const p = action === "close" ? moveTo(t, "Closed") : moveTo(t, "Escalated", "", "Urgent");
      p.then(() => toast.success(`${t.ticketId} ${action === "close" ? "closed" : "escalated"}.`)).catch(fail);
    },
    async bulk(ids: string[], fn: (t: SupportTicket) => Promise<unknown>, done: string) {
      const results = await Promise.allSettled(ids.map((id) => find(id)).filter((t): t is SupportTicket => !!t).map(fn));
      const failed = results.filter((r) => r.status === "rejected").length;
      if (failed) toast.error(`${failed} ticket(s) couldn't be updated.`);
      if (results.length - failed) toast.success(`${results.length - failed} ticket(s) ${done}.`);
    },
    moveTo,
    assignTo: (t: SupportTicket, name: string) => {
      const agent = agentByName(name);
      return agent ? actions.assign.mutateAsync({ id: t.id, user: agent.id }) : Promise.reject(new Error("Unknown agent"));
    },
    async createTicket(data: { category: TicketCategory | ""; module: string; subject: string; description: string; priority: TicketPriority | ""; attachmentIds?: string[]; source?: string }) {
      try {
        const t = await create.mutateAsync({
          category: CATEGORY_VALUE[(data.category || "Other") as TicketCategory], module: data.module, subject: data.subject.trim(),
          description: data.description.trim(), priority: PRIORITY_VALUE[(data.priority || "Normal") as TicketPriority],
          source: data.source, attachment_ids: data.attachmentIds ?? [],
        });
        toast.success(`${t.code} created.`);
        return t;
      } catch (e) {
        fail(e);
        return null;
      }
    },
  };
}
