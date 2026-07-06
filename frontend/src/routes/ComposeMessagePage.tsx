import { MessageComposeForm } from "@/components/messages/forms/MessageComposeForm";

export function ComposeMessagePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Compose Message</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          Create and send messages to students, parents, teachers, or staff
        </p>
      </div>
      <MessageComposeForm />
    </div>
  );
}
