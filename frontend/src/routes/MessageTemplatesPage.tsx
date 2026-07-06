import { Zap } from "lucide-react";
import { MessageTemplateCard } from "@/components/messages/MessageTemplateCard";
import { MESSAGE_TEMPLATES } from "@/data/messagesData";

export function MessageTemplatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Message Templates</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          {MESSAGE_TEMPLATES.length} ready-to-use templates for common school communications
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 px-4 py-3">
        <Zap className="h-4 w-4 shrink-0 text-blue-600" />
        <p className="text-[13px] text-blue-800 dark:text-blue-300">
          Click <span className="font-semibold">Use Template</span> to open a pre-filled compose form. Customize before sending.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {MESSAGE_TEMPLATES.map((tpl) => (
          <MessageTemplateCard key={tpl.id} template={tpl} />
        ))}
      </div>
    </div>
  );
}
