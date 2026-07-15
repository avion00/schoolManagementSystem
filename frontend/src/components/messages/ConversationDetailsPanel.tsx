import { useState } from "react";
import {
  Archive, BellOff, CalendarClock, Download, Flag, FolderOpen, GraduationCap, Lock, LogOut,
  NotebookPen, Phone, Pin, ScrollText, ShieldAlert, Trash2, UserPlus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { GroupMembersPanel } from "@/components/messages/GroupMembersPanel";
import { ParentMessageTemplate } from "@/components/teacher/ParentMessageTemplate";
import { PinnedMessagesPanel } from "@/components/messages/PinnedMessagesPanel";
import { SharedFilesPanel } from "@/components/messages/SharedFilesPanel";
import { Button } from "@/components/ui/button";
import {
  CHAT_USERS, chatUserById, type ChatMessage, type Conversation,
} from "@/data/messagesData";
import { assignedStudents } from "@/data/teacherDashboardData";
import { messagesService } from "@/lib/messagesService";

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="border-b border-border/60 px-4 py-4 last:border-b-0">
      <div className="mb-2.5 flex items-center justify-between">
        <p className="text-[10.5px] font-bold uppercase tracking-widest text-muted-foreground/60">{title}</p>
        {action}
      </div>
      {children}
    </div>
  );
}

export function ConversationDetailsPanel({
  conversation,
  messages,
  currentUserId,
  isSuperAdmin,
  onTogglePin,
  onToggleMute,
  onToggleArchive,
  onToggleLock,
  onDeleteConversation,
  onExport,
  onRemoveMember,
  onAddMember,
  onSendTemplate,
}: {
  conversation: Conversation;
  messages: ChatMessage[];
  currentUserId: string;
  isSuperAdmin: boolean;
  onTogglePin: () => void;
  onToggleMute: () => void;
  onToggleArchive: () => void;
  onToggleLock: () => void;
  onDeleteConversation: () => void;
  onExport: () => void;
  onRemoveMember: (userId: string) => void;
  onAddMember: (userId: string) => void;
  /** Sends a quick-template message straight into this conversation (teacher parent/student chats). */
  onSendTemplate?: (text: string) => void;
}) {
  const navigate = useNavigate();
  const [showAddMember, setShowAddMember] = useState(false);
  const isGroupLike = conversation.type !== "direct" && conversation.type !== "support_request";
  const isAdminOfGroup = conversation.adminIds.includes(currentUserId);
  const canManageGroup = isSuperAdmin || isAdminOfGroup;
  const candidates = CHAT_USERS.filter((u) => !conversation.participantIds.includes(u.id));
  const auditForConversation = messagesService.getAuditEvents().filter((e) => e.conversationId === conversation.id).slice(0, 4);

  const otherUserId = !isGroupLike ? conversation.participantIds.find((id) => id !== currentUserId) : undefined;
  const otherUser = otherUserId ? chatUserById(otherUserId) : undefined;
  const linkedStudent = conversation.relatedStudentId
    ? assignedStudents.find((s) => String(s.id) === conversation.relatedStudentId)
    : undefined;

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {linkedStudent && (
        <Section title={otherUser?.role === "Parent" ? "Student & guardian" : "Student"}>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => navigate(`/teacher/students/${linkedStudent.id}`)}
              className="flex w-full items-center gap-2.5 rounded-lg border border-border/60 px-2.5 py-2 text-left hover:bg-muted/60"
            >
              <GraduationCap className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <p className="truncate text-[12.5px] font-medium text-foreground">{linkedStudent.name}</p>
                <p className="truncate text-[11px] text-muted-foreground">{linkedStudent.className}-{linkedStudent.section} · Roll {linkedStudent.roll}</p>
              </div>
            </button>
            {otherUser?.role === "Parent" && (
              <p className="flex items-center gap-1.5 px-1 text-[11.5px] text-muted-foreground">
                <Phone className="h-3 w-3" /> {linkedStudent.guardianPhone}
              </p>
            )}
          </div>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <Button variant="outline" size="sm" className="h-7 gap-1.5 text-[11px]" onClick={() => navigate("/teacher/parents")}>
              <CalendarClock className="h-3.5 w-3.5" /> Schedule meeting
            </Button>
            <Button variant="outline" size="sm" className="h-7 gap-1.5 text-[11px]" onClick={() => toast.success(`Note added for ${linkedStudent.name} (demo)`)}>
              <NotebookPen className="h-3.5 w-3.5" /> Add note
            </Button>
          </div>
        </Section>
      )}

      {otherUser?.role === "Parent" && onSendTemplate && (
        <Section title="Quick templates">
          <ParentMessageTemplate onSelect={(text) => onSendTemplate(text.replace("{student}", linkedStudent?.name ?? "your child"))} />
        </Section>
      )}

      {isGroupLike && !isSuperAdmin && (
        <Section title="Class actions">
          <Button variant="outline" size="sm" className="h-7 gap-1.5 text-[11px]" onClick={() => navigate("/teacher/materials")}>
            <FolderOpen className="h-3.5 w-3.5" /> Share material
          </Button>
        </Section>
      )}

      <Section title="Conversation info">
        <p className="text-[12.5px] text-muted-foreground">
          {isGroupLike ? `${conversation.participantIds.length} members` : "Direct conversation"} · Created via SchoolOS Messages
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="h-7 gap-1.5 text-[11.5px]" onClick={onToggleMute}>
            <BellOff className="h-3.5 w-3.5" /> {conversation.muted ? "Unmute" : "Mute"}
          </Button>
          <Button variant="outline" size="sm" className="h-7 gap-1.5 text-[11.5px]" onClick={onTogglePin}>
            <Pin className="h-3.5 w-3.5" /> {conversation.pinned ? "Unpin" : "Pin"}
          </Button>
          <Button variant="outline" size="sm" className="h-7 gap-1.5 text-[11.5px]" onClick={onToggleArchive}>
            <Archive className="h-3.5 w-3.5" /> {conversation.archived ? "Unarchive" : "Archive"}
          </Button>
        </div>
      </Section>

      {isGroupLike && (
        <Section
          title={`Members (${conversation.participantIds.length})`}
          action={
            canManageGroup && (
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowAddMember((s) => !s)} aria-label="Add member">
                <UserPlus className="h-3.5 w-3.5" />
              </Button>
            )
          }
        >
          {showAddMember && (
            <div className="mb-2 max-h-40 space-y-0.5 overflow-y-auto rounded-lg border border-border/60 p-1.5">
              {candidates.length === 0 ? (
                <p className="px-2 py-1.5 text-[11.5px] text-muted-foreground">Everyone is already in this conversation.</p>
              ) : (
                candidates.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => { onAddMember(u.id); setShowAddMember(false); }}
                    className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-[12px] hover:bg-muted"
                  >
                    <span>{u.name}</span>
                    <span className="text-[10.5px] text-muted-foreground">{u.role}</span>
                  </button>
                ))
              )}
            </div>
          )}
          <GroupMembersPanel conversation={conversation} canRemove={canManageGroup} onRemoveMember={onRemoveMember} />
        </Section>
      )}

      <Section title="Pinned messages">
        <PinnedMessagesPanel messages={messages} />
      </Section>

      <Section title="Shared files">
        <SharedFilesPanel messages={messages} onDownload={(name) => isSuperAdmin && messagesService.logFileDownload(conversation.id, currentUserId, name)} />
      </Section>

      {!canManageGroup && isGroupLike && (
        <Section title="Membership">
          <Button variant="outline" size="sm" className="h-8 w-full gap-1.5 text-[12px] text-destructive hover:text-destructive">
            <LogOut className="h-3.5 w-3.5" /> Leave group
          </Button>
        </Section>
      )}

      {isSuperAdmin && (
        <Section title="Super Admin tools">
          <div className="space-y-2">
            <p className="rounded-lg bg-amber-50 px-2.5 py-2 text-[11px] text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
              <ShieldAlert className="mr-1 inline h-3 w-3" /> Super Admin conversation access is logged for audit and safety.
            </p>
            <Button variant="outline" size="sm" className="h-8 w-full justify-start gap-2 text-[12px]" onClick={onExport}>
              <Download className="h-3.5 w-3.5" /> Export conversation
            </Button>
            <Button variant="outline" size="sm" className="h-8 w-full justify-start gap-2 text-[12px]" onClick={onToggleLock}>
              <Lock className="h-3.5 w-3.5" /> {conversation.locked ? "Unlock" : "Lock"} conversation
            </Button>
            <Button variant="outline" size="sm" className="h-8 w-full justify-start gap-2 text-[12px]" onClick={() => navigate("/messages/moderation")}>
              <Flag className="h-3.5 w-3.5" /> View in moderation
            </Button>
            <Button
              variant="outline" size="sm"
              className="h-8 w-full justify-start gap-2 text-[12px] text-destructive hover:text-destructive"
              onClick={onDeleteConversation}
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete conversation
            </Button>
          </div>

          {auditForConversation.length > 0 && (
            <div className="mt-3">
              <p className="mb-1.5 flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                <ScrollText className="h-3 w-3" /> Recent audit trail
              </p>
              <div className="space-y-1">
                {auditForConversation.map((e) => (
                  <div key={e.id} className="rounded-lg bg-muted/40 px-2 py-1.5 text-[11px] text-muted-foreground">
                    <span className="font-medium text-foreground">{chatUserById(e.actorId)?.name ?? e.actorId}</span> — {e.detail}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Section>
      )}
    </div>
  );
}
