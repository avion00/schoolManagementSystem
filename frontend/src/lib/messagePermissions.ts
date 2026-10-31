// Messaging rules for the UI. Who can message whom and who can create groups
// mirror the backend policy (apps/messaging/policy.py) by role; staff powers
// (broadcasts, viewing/exporting any chat, moderation) come from the signed-in
// user's real permissions. The server enforces all of these regardless.
import type { ChatRole } from "@/api/types/messages";

const CAN_MESSAGE: Record<ChatRole, ChatRole[] | "all"> = {
  "Super Admin": "all",
  Admin: ["Teacher", "Parent", "Student", "Staff", "Principal", "Admin", "Super Admin"],
  Principal: ["Teacher", "Parent", "Student", "Staff", "Admin", "Super Admin"],
  Teacher: ["Student", "Parent", "Teacher", "Staff", "Admin", "Principal", "Super Admin"],
  Parent: ["Teacher", "Admin", "Principal"],
  Student: ["Teacher", "Admin", "Principal"],
  Staff: ["Staff", "Admin", "Principal", "Super Admin"],
};
const CAN_CREATE_GROUPS: ChatRole[] = ["Super Admin", "Admin", "Principal", "Teacher"];

let permissions = new Set<string>();
let superuser = false;

/** Called with the signed-in user's permissions (see messagesService.init). */
export function setMessagingPermissions(codes: string[], isSuperuser: boolean) {
  permissions = new Set(codes);
  superuser = isSuperuser;
}

const has = (code: string) => superuser || permissions.has(code);

export function canRolesMessage(fromRole: ChatRole, toRole: ChatRole): boolean {
  const allowed = CAN_MESSAGE[fromRole];
  return allowed === "all" || allowed.includes(toRole);
}
/** Whether a first message needs approval is decided per person by the server (e.g. a parent writing to a teacher who doesn't teach their child). */
export function needsApproval(_fromRole: ChatRole, _toRole: ChatRole): boolean {
  return false;
}
export function canCreateGroup(role: ChatRole): boolean {
  return CAN_CREATE_GROUPS.includes(role);
}
export function canSendBroadcast(_role?: ChatRole): boolean {
  return has("message.broadcast");
}
export function canViewAllConversations(_role?: ChatRole): boolean {
  return has("message.view_all");
}
export function canExportConversations(_role?: ChatRole): boolean {
  return has("message.export");
}
export function canModerate(_role?: ChatRole): boolean {
  return has("message.moderate");
}
