import { Reveal } from "@/components/motion";
import { StudentLibraryCard } from "@/components/student/StudentLibraryCard";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { libraryBooks, recommendedBooks } from "@/data/studentDashboardData";

export function StudentLibrary() {
  const totalFine = libraryBooks.reduce((sum, b) => sum + b.fine, 0);

  return (
    <div className="space-y-4">
      <Reveal>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Library</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          {libraryBooks.filter((b) => b.status !== "Returned").length} books currently borrowed
          {totalFine > 0 && ` · Outstanding fine: ${totalFine}`}
        </p>
      </Reveal>

      <Reveal delay={60} className="space-y-2">
        {libraryBooks.map((b) => <StudentLibraryCard key={b.id} book={b} />)}
      </Reveal>

      <Reveal delay={100}>
        <PremiumCard className="p-4">
          <p className="mb-2 text-[13px] font-semibold text-foreground">Recommended reading</p>
          <ul className="list-disc space-y-1 pl-5 text-[12.5px] text-foreground">
            {recommendedBooks.map((b) => <li key={b}>{b}</li>)}
          </ul>
        </PremiumCard>
      </Reveal>
    </div>
  );
}
