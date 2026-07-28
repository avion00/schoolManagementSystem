import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/hermes/AppShell";
import { useAuth } from "@/components/hermes/AuthProvider";
import { assignmentsFor } from "@/lib/hermes-assignments";
import { AssignmentCard } from "./my-work";

export const Route = createFileRoute("/completed")({
  head: () => ({ meta: [{ title: "Completed Work — Hermes" }] }),
  component: CompletedPage,
});

function CompletedPage() {
  const { user } = useAuth();
  if (!user) return null;
  const mine = assignmentsFor(user.id).filter((a) => ["Approved", "Scheduled", "Published"].includes(a.status));
  return (
    <>
      <PageHeader title="Completed work" subtitle="Everything you've submitted that has been approved, scheduled or published." />
      {mine.length === 0 ? (
        <div className="text-sm text-muted-foreground border border-dashed rounded-md p-8 text-center">No completed work yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {mine.map((a) => <AssignmentCard key={a.id} a={a} />)}
        </div>
      )}
    </>
  );
}
