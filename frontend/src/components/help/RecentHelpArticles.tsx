import { ArrowRight, FileSearch } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RECENT_HELP_ARTICLES } from "@/data/helpData";

export function RecentHelpArticles({ query = "" }: { query?: string }) {
  const q = query.trim().toLowerCase();
  const filtered = q
    ? RECENT_HELP_ARTICLES.filter(
        (a) => a.title.toLowerCase().includes(q) || a.category.toLowerCase().includes(q),
      )
    : RECENT_HELP_ARTICLES;

  return (
    <Card className="rounded-2xl border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Recent Help Articles</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <FileSearch className="h-5 w-5 text-muted-foreground/50" />
            <p className="text-[12.5px] text-muted-foreground">No articles match “{query}”.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {filtered.map((article) => (
              <button
                key={article.id}
                type="button"
                onClick={() => toast.info(`"${article.title}" article is coming soon.`)}
                className="group flex w-full items-center gap-3 py-3 text-left transition-colors hover:text-primary"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-foreground group-hover:text-primary">
                    {article.title}
                  </p>
                  <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                    {article.category} · {article.readTime}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/50 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-primary" />
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
