import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/hermes/AppShell";
import { useAuth } from "@/components/hermes/AuthProvider";
import { assignmentsFor } from "@/lib/hermes-assignments";
import { RevisionCard } from "./my-work";

export const Route = createFileRoute("/revisions")({
  head: () => ({ meta: [{ title: "Revision Requests — Hermes" }] }),
  component: RevisionsPage,
});

function RevisionsPage() {
  const { user } = useAuth();
  if (!user) return null;
  const mine = assignmentsFor(user.id).filter((a) => a.status === "Revision Requested");
  return (
    <>
      <PageHeader title="Revision requests" subtitle="Assets sent back with change instructions. Open each task to read the notes and upload a new version." />
      {mine.length === 0 ? (
        <div className="text-sm text-muted-foreground border border-dashed rounded-md p-8 text-center">Nothing waiting on revision. Nice.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {mine.map((a) => <RevisionCard key={a.id} a={a} />)}
        </div>
      )}
    </>
  );
}
