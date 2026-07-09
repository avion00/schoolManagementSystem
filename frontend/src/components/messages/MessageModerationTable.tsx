import { Download, Eye, Lock, MoreHorizontal, ShieldAlert, Trash2, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { chatUserById, conversationById, type ModerationReport, type ModerationStatus } from "@/data/messagesData";

const STATUS_VARIANT: Record<ModerationStatus, "default" | "success" | "destructive" | "secondary"> = {
  open: "default", reviewed: "secondary", dismissed: "secondary", actioned: "destructive",
};

const PRIORITY_VARIANT: Record<ModerationReport["priority"], "secondary" | "warning" | "destructive"> = {
  low: "secondary", normal: "warning", high: "destructive",
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function MessageModerationTable({
  reports,
  onReview,
  onDismiss,
  onWarn,
  onDeleteMessage,
  onLockConversation,
  onExportEvidence,
}: {
  reports: ModerationReport[];
  onReview: (id: string) => void;
  onDismiss: (id: string) => void;
  onWarn: (id: string) => void;
  onDeleteMessage: (id: string) => void;
  onLockConversation: (id: string) => void;
  onExportEvidence: (id: string) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Message ID</TableHead>
            <TableHead>Conversation</TableHead>
            <TableHead>Sender</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Reported At</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-mono text-[11.5px] text-muted-foreground">{r.messageId}</TableCell>
              <TableCell>{conversationById(r.conversationId)?.title ?? r.conversationId}</TableCell>
              <TableCell className="font-medium text-foreground">{chatUserById(r.senderId)?.name ?? r.senderId}</TableCell>
              <TableCell className="max-w-xs truncate text-muted-foreground">{r.reason}</TableCell>
              <TableCell><Badge variant={PRIORITY_VARIANT[r.priority]} className="capitalize">{r.priority}</Badge></TableCell>
              <TableCell><Badge variant={STATUS_VARIANT[r.status]} className="capitalize">{r.status}</Badge></TableCell>
              <TableCell className="text-muted-foreground">{formatDateTime(r.reportedAt)}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onReview(r.id)}><Eye className="mr-2 h-3.5 w-3.5" /> Review</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDismiss(r.id)}><X className="mr-2 h-3.5 w-3.5" /> Dismiss</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onWarn(r.id)}><ShieldAlert className="mr-2 h-3.5 w-3.5" /> Warn user</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDeleteMessage(r.id)} className="text-destructive focus:text-destructive">
                      <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete message
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onLockConversation(r.id)}><Lock className="mr-2 h-3.5 w-3.5" /> Lock conversation</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onExportEvidence(r.id)}><Download className="mr-2 h-3.5 w-3.5" /> Export evidence</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
