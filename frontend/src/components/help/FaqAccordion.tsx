import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FAQ_ITEMS } from "@/data/helpData";
import { cn } from "@/lib/utils";

function FaqRow({
  question,
  answer,
  open,
  onToggle,
}: {
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-border/50 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-3 py-3.5 text-left transition-colors hover:text-primary"
      >
        <span className="flex-1 text-[13px] font-medium text-foreground">{question}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180 text-primary",
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <p className="pb-4 text-[12.5px] leading-relaxed text-muted-foreground">{answer}</p>
        </div>
      </div>
    </div>
  );
}

export function FaqAccordion({ query = "" }: { query?: string }) {
  const [openId, setOpenId] = useState<string | null>(FAQ_ITEMS[0]?.id ?? null);

  const q = query.trim().toLowerCase();
  const filtered = q
    ? FAQ_ITEMS.filter(
        (f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q),
      )
    : FAQ_ITEMS;

  return (
    <Card className="rounded-2xl border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Frequently Asked Questions</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <HelpCircle className="h-5 w-5 text-muted-foreground/50" />
            <p className="text-[12.5px] text-muted-foreground">
              No questions match “{query}”.
            </p>
          </div>
        ) : (
          filtered.map((item) => (
            <FaqRow
              key={item.id}
              question={item.question}
              answer={item.answer}
              open={openId === item.id}
              onToggle={() => setOpenId((cur) => (cur === item.id ? null : item.id))}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}
