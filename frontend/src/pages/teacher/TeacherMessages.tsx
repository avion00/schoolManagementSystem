import { MessagesChatsPage } from "@/routes/MessagesChatsPage";

/**
 * Teacher's Messages page — reuses the same real-time messaging module as
 * Super Admin. It's already role-filtered: `resolveCurrentChatUser` maps the
 * signed-in teacher onto their own chat identity, so they only ever see
 * their own conversations (parents, class groups, other teachers,
 * principal/admin) — never the whole school's conversations, moderation
 * tools, or export/audit features (those stay admin-only routes).
 */
export function TeacherMessages() {
  return <MessagesChatsPage />;
}
