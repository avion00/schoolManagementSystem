import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/hermes/AppShell";
import { useAuth } from "@/components/hermes/AuthProvider";
import { assignmentsFor, type AssignmentStatus } from "@/lib/hermes-assignments";
import { AssignmentCard } from "./my-work";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/tasks")({
  head: () => ({ meta: [{ title: "Production Tasks — Hermes" }] }),
  component: Tasks,
});

const filters: (AssignmentStatus | "All")[] = ["All", "Assigned", "In Production", "Submitted for Review", "Revision Requested", "Resubmitted", "Approved", "Scheduled", "Published"];

function Tasks() {
  const { user } = useAuth();
  const [status, setStatus] = useState<AssignmentStatus | "All">("All");
  if (!user) return null;
  const mine = assignmentsFor(user.id);
  const visible = status === "All" ? mine : mine.filter((a) => a.status === status);

  return (
    <>
      <PageHeader title="Production tasks" subtitle="Every task assigned to you, filterable by status." />
      <div className="flex flex-wrap gap-2 mb-4">
        {filters.map((f) => (
          <Button key={f} size="sm" variant={status === f ? "default" : "outline"} onClick={() => setStatus(f)}>
            {f} <span className="ml-1.5 opacity-60">{f === "All" ? mine.length : mine.filter((a) => a.status === f).length}</span>
          </Button>
        ))}
      </div>
      {visible.length === 0 ? (
        <div className="text-sm text-muted-foreground border border-dashed rounded-md p-8 text-center">No tasks in this status.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {visible.map((a) => <AssignmentCard key={a.id} a={a} />)}
        </div>
      )}
    </>
  );
}
