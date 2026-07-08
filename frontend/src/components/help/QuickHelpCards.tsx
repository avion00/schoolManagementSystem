import { Reveal, TiltCard } from "@/components/motion";
import { Card, CardContent } from "@/components/ui/card";
import { QUICK_HELP_CARDS, type QuickHelpActionId } from "@/data/helpData";

export function QuickHelpCards({
  onAction,
}: {
  onAction: (id: QuickHelpActionId) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {QUICK_HELP_CARDS.map((card, i) => {
        const Icon = card.icon;
        return (
          <Reveal key={card.id} delay={i * 40}>
            <TiltCard max={4}>
              <button
                type="button"
                onClick={() => onAction(card.id)}
                className="group w-full text-left"
              >
                <Card className="t-lift h-full rounded-2xl border-border/60 shadow-sm transition-colors duration-150 hover:border-primary/30">
                  <CardContent className="flex items-start gap-3.5 p-5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-transform duration-200 group-hover:scale-105">
                      <Icon className="h-[18px] w-[18px] text-primary" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-semibold leading-snug text-foreground">
                        {card.title}
                      </p>
                      <p className="mt-1 text-[12px] leading-snug text-muted-foreground">
                        {card.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </button>
            </TiltCard>
          </Reveal>
        );
      })}
    </div>
  );
}
