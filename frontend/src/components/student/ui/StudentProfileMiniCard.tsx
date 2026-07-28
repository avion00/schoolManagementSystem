import { useNavigate } from "react-router-dom";

import { Reveal } from "@/components/motion";
import { StudentStatusPill } from "@/components/student/ui/StudentStatusPill";
import { Card, CardContent } from "@/components/ui/card";

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

/** Compact identity card for the right-column sidebar — avatar, class, roll, status. */
export function StudentProfileMiniCard({
  name,
  className,
  section,
  roll,
  admissionNo,
  status,
}: {
  name: string;
  className: string;
  section: string;
  roll: string;
  admissionNo: string;
  status: "Active" | "Inactive";
}) {
  const navigate = useNavigate();
  return (
    <Reveal>
      <Card className="rounded-2xl border-border/60 shadow-elevated">
        <CardContent
          className="flex cursor-pointer items-center gap-3 p-4 transition-colors hover:bg-muted/40"
          onClick={() => navigate("/student/profile")}
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary text-[14px] font-semibold text-secondary-foreground">
            {initials(name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-semibold text-foreground">{name}</p>
            <p className="truncate text-[11.5px] text-muted-foreground">
              {className} {section} · Roll {roll}
            </p>
            <p className="truncate text-[10.5px] text-muted-foreground/80">{admissionNo}</p>
          </div>
          <StudentStatusPill label={status} tone={status === "Active" ? "success" : "neutral"} />
        </CardContent>
      </Card>
    </Reveal>
  );
}
