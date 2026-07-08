import { Search, X } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { HELP_QUICK_TAGS } from "@/data/helpData";
import { cn } from "@/lib/utils";

export function HelpHero({
  query,
  onQueryChange,
}: {
  query: string;
  onQueryChange: (value: string) => void;
}) {
  return (
    <Card className="overflow-hidden rounded-2xl border-border/60 bg-gradient-to-br from-primary/[0.06] via-card to-card shadow-sm">
      <CardContent className="flex flex-col items-center gap-5 px-6 py-10 text-center sm:px-10">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.01em] text-foreground sm:text-[28px]">
            How can we help you?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Find answers, contact support, or explore guides for using the school management system.
          </p>
        </div>

        <div className="group relative w-full max-w-xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60 transition-colors duration-150 group-focus-within:text-primary" />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search help articles, modules, or common questions..."
            aria-label="Search help articles, modules, or common questions"
            className={cn(
              "h-12 w-full rounded-xl border border-input bg-background pl-11 pr-10 text-[13.5px] text-foreground shadow-sm",
              "transition-all duration-200 ease-out placeholder:text-muted-foreground/70",
              "focus:scale-[1.01] focus:border-primary/50 focus:shadow-md focus:outline-none focus:ring-2 focus:ring-ring",
            )}
          />
          {query && (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              aria-label="Clear search"
              className="absolute right-3.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {HELP_QUICK_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onQueryChange(tag)}
              data-active={query.toLowerCase() === tag.toLowerCase()}
              className={cn(
                "rounded-full border px-3 py-1 text-[12px] font-medium text-muted-foreground transition-all duration-150",
                "hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/5 hover:text-primary",
                "data-[active=true]:border-primary/50 data-[active=true]:bg-primary/10 data-[active=true]:text-primary",
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
