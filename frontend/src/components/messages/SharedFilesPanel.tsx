import { AttachmentPreview } from "@/components/messages/AttachmentPreview";
import type { ChatMessage } from "@/data/messagesData";

export function SharedFilesPanel({ messages, onDownload }: { messages: ChatMessage[]; onDownload?: (fileName: string) => void }) {
  const files = messages.flatMap((m) => m.attachments.map((a) => ({ attachment: a, messageId: m.id })));

  if (files.length === 0) {
    return <p className="py-4 text-center text-[12px] text-muted-foreground">No shared files yet.</p>;
  }

  return (
    <div className="space-y-2">
      {files.map(({ attachment, messageId }) => (
        <AttachmentPreview key={`${messageId}-${attachment.id}`} attachment={attachment} onDownload={() => onDownload?.(attachment.name)} />
      ))}
    </div>
  );
}
