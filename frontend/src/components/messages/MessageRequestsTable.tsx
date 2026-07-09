import { Ban, Check, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { chatUserById, type MessageRequestItem, type MessageRequestStatus } from "@/data/messagesData";

const STATUS_VARIANT: Record<MessageRequestStatus, "default" | "success" | "destructive" | "secondary"> = {
  pending: "default", approved: "success", rejected: "destructive", blocked: "destructive",
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function MessageRequestsTable({
  requests,
  onApprove,
  onReject,
  onBlock,
}: {
  requests: MessageRequestItem[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onBlock: (id: string) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>From</TableHead>
            <TableHead>To</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Requested</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium text-foreground">{chatUserById(r.fromUserId)?.name ?? r.fromUserId}</TableCell>
              <TableCell>{chatUserById(r.toUserId)?.name ?? r.toUserId}</TableCell>
              <TableCell className="max-w-xs truncate text-muted-foreground">{r.reason}</TableCell>
              <TableCell><Badge variant={STATUS_VARIANT[r.status]} className="capitalize">{r.status}</Badge></TableCell>
              <TableCell className="text-muted-foreground">{formatDateTime(r.requestedAt)}</TableCell>
              <TableCell className="text-right">
                {r.status === "pending" ? (
                  <div className="flex justify-end gap-1.5">
                    <Button variant="outline" size="sm" className="h-7 gap-1 text-[11px] text-emerald-600 hover:text-emerald-600" onClick={() => onApprove(r.id)}>
                      <Check className="h-3 w-3" /> Approve
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 gap-1 text-[11px] text-destructive hover:text-destructive" onClick={() => onReject(r.id)}>
                      <X className="h-3 w-3" /> Reject
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 gap-1 text-[11px]" onClick={() => onBlock(r.id)}>
                      <Ban className="h-3 w-3" /> Block
                    </Button>
                  </div>
                ) : (
                  <span className="text-[11px] text-muted-foreground">No action needed</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
