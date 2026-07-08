import { useState } from "react";
import { toast } from "sonner";

import { Reveal } from "@/components/motion";
import { FaqAccordion } from "@/components/help/FaqAccordion";
import { HelpHero } from "@/components/help/HelpHero";
import { ModuleHelpGuides } from "@/components/help/ModuleHelpGuides";
import { QuickHelpCards } from "@/components/help/QuickHelpCards";
import { RecentHelpArticles } from "@/components/help/RecentHelpArticles";
import { SupportContactCard } from "@/components/help/SupportContactCard";
import { SupportTicketForm } from "@/components/help/SupportTicketForm";
import { SystemStatusCard } from "@/components/help/SystemStatusCard";
import type { QuickHelpActionId } from "@/data/helpData";

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function HelpPage() {
  const [query, setQuery] = useState("");

  function handleQuickAction(id: QuickHelpActionId) {
    switch (id) {
      case "contact-support":
      case "report-problem":
      case "request-feature":
        scrollToId("support-ticket-form");
        break;
      case "documentation":
        scrollToId("module-help-guides");
        break;
      case "system-status":
        scrollToId("system-status");
        break;
      case "tutorials":
        toast.info("Video tutorials are coming soon.");
        break;
    }
  }

  return (
    <div className="space-y-5">
      <Reveal delay={0}>
        <HelpHero query={query} onQueryChange={setQuery} />
      </Reveal>

      <Reveal delay={60}>
        <QuickHelpCards onAction={handleQuickAction} />
      </Reveal>

      <Reveal delay={120}>
        <SupportTicketForm />
      </Reveal>

      <Reveal delay={160}>
        <FaqAccordion query={query} />
      </Reveal>

      <Reveal delay={200}>
        <ModuleHelpGuides query={query} />
      </Reveal>

      <Reveal delay={240} className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SupportContactCard />
        <SystemStatusCard />
      </Reveal>

      <Reveal delay={280}>
        <RecentHelpArticles query={query} />
      </Reveal>
    </div>
  );
}
