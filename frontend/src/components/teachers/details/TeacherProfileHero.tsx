import { ArrowLeft, Download, Mail, Pencil, Phone, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { TeacherAvatar } from "@/components/teachers/TeacherAvatar";
import { TeacherStatusBadge } from "@/components/teachers/TeacherStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Teacher } from "@/data/teachersData";

export function TeacherProfileHero({ teacher }: { teacher: Teacher }) {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/5 via-card to-accent/20 shadow-sm">
      {/* Decorative circles */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/5" />
      <div className="pointer-events-none absolute -bottom-12 right-24 h-40 w-40 rounded-full bg-primary/5" />

      <div className="relative flex flex-wrap items-start gap-5 p-6 md:p-8">
        {/* Avatar */}
        <div className="shrink-0">
          <TeacherAvatar name={teacher.name} size="lg" />
        </div>

        {/* Main info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {teacher.name}
              </h1>
              <p className="mt-0.5 text-sm font-medium text-muted-foreground">
                {teacher.designation} &nbsp;·&nbsp; {teacher.department}
              </p>
            </div>
            <TeacherStatusBadge status={teacher.status} />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="outline" className="text-[11px] gap-1">
              <span className="text-muted-foreground">EMP ID:</span> {teacher.employeeId}
            </Badge>
            <Badge variant="outline" className="text-[11px] gap-1">
              <span className="text-muted-foreground">Code:</span> {teacher.staffCode}
            </Badge>
            <Badge variant="outline" className="text-[11px] gap-1">
              <span className="text-muted-foreground">Subject:</span> {teacher.subject}
            </Badge>
            <Badge variant="outline" className="text-[11px] gap-1">
              <span className="text-muted-foreground">Type:</span> {teacher.employmentType}
            </Badge>
          </div>

          <div className="mt-3 flex flex-wrap gap-4 text-[12px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" />
              {teacher.phone}
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              {teacher.email}
            </span>
          </div>

          {teacher.assignedClasses.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {teacher.assignedClasses.map((c) => (
                <Badge key={c} variant="secondary" className="text-[11px]">
                  {c}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 md:flex-col">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Button>
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => navigate(`/teachers/${teacher.id}/edit`)}
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigate("/teachers/teacher-form/print")}>
            <Printer className="h-3.5 w-3.5" />
            Print
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
        </div>
      </div>
    </div>
  );
}
