import { BookOpen, Clock } from "lucide-react";
import { useMemo, useState } from "react";

import { PremiumCard } from "@/components/ui/PremiumCard";
import { PremiumSearchInput } from "@/components/ui/PremiumSearchInput";
import { helpArticles, type HelpArticle } from "@/data/teacherHelpData";

export function HelpKnowledgeBase({ onView }: { onView: (article: HelpArticle) => void }) {
  const [search, setSearch] = useState("");

  const articles = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return helpArticles;
    return helpArticles.filter((a) => a.title.toLowerCase().includes(q) || a.category.toLowerCase().includes(q));
  }, [search]);

  return (
    <div className="space-y-3">
      <PremiumSearchInput value={search} onChange={setSearch} placeholder="Search help articles…" />
      <div className="space-y-2">
        {articles.map((a) => (
          <PremiumCard key={a.id} hoverable className="flex items-center gap-3 p-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BookOpen className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <button type="button" onClick={() => onView(a)} className="block truncate text-left text-[12.5px] font-medium text-foreground hover:underline">
                {a.title}
              </button>
              <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span>{a.category}</span>
                <span aria-hidden="true">·</span>
                <Clock className="h-3 w-3" /> {a.readMins} min read
              </p>
            </div>
            <button type="button" onClick={() => onView(a)} className="shrink-0 text-[11.5px] font-medium text-primary hover:underline">
              View
            </button>
          </PremiumCard>
        ))}
        {articles.length === 0 && <p className="py-6 text-center text-[12.5px] text-muted-foreground">No articles match your search.</p>}
      </div>
    </div>
  );
}
