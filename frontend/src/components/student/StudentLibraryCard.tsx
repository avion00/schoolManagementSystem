import { BookOpen } from "lucide-react";

import { PremiumBadge, type PremiumBadgeTone } from "@/components/ui/PremiumBadge";
import { PremiumCard } from "@/components/ui/PremiumCard";
import type { LibraryBook } from "@/data/studentDashboardData";

const STATUS_TONE: Record<LibraryBook["status"], PremiumBadgeTone> = {
  Borrowed: "info", Overdue: "danger", Returned: "success",
};

export function StudentLibraryCard({ book }: { book: LibraryBook }) {
  return (
    <PremiumCard className="flex items-center gap-3 p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <BookOpen className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-foreground">{book.title}</p>
        <p className="truncate text-[11.5px] text-muted-foreground">{book.author} · Due {book.dueDate}</p>
      </div>
      <div className="shrink-0 text-right">
        <PremiumBadge label={book.status} tone={STATUS_TONE[book.status]} />
        {book.fine > 0 && <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">Fine: {book.fine}</p>}
      </div>
    </PremiumCard>
  );
}
