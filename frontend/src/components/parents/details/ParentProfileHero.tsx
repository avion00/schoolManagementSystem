import { ArrowLeft, Download, Mail, Pencil, Phone, Printer, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { ParentAvatar } from "@/components/parents/ParentAvatar";
import { ParentStatusBadge } from "@/components/parents/ParentStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Parent } from "@/data/parentsData";

export function ParentProfileHero({ parent }: { parent: Parent }) {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/5 via-card to-accent/20 shadow-sm">
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/5" />
      <div className="pointer-events-none absolute -bottom-12 right-24 h-40 w-40 rounded-full bg-primary/5" />

      <div className="relative flex flex-wrap items-start gap-5 p-6 md:p-8">
        <ParentAvatar name={parent.name} size="lg" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{parent.name}</h1>
              <p className="mt-0.5 text-sm font-medium text-muted-foreground">
                {parent.relation} &nbsp;·&nbsp; {parent.occupation}
              </p>
            </div>
            <ParentStatusBadge status={parent.status} />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="outline" className="text-[11px] gap-1">
              <span className="text-muted-foreground">ID:</span> {parent.parentId}
            </Badge>
            <Badge variant="outline" className="text-[11px] gap-1">
              <span className="text-muted-foreground">Code:</span> {parent.guardianCode}
            </Badge>
            <Badge variant="outline" className="text-[11px] gap-1">
              <span className="text-muted-foreground">Gender:</span> {parent.gender}
            </Badge>
            <Badge variant="outline" className="text-[11px] gap-1 text-primary">
              <Users className="h-2.5 w-2.5" />
              {parent.linkedChildren.length} {parent.linkedChildren.length === 1 ? "child" : "children"}
            </Badge>
          </div>

          <div className="mt-3 flex flex-wrap gap-4 text-[12px] text-muted-foreground">
            <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{parent.phone}</span>
            <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{parent.email}</span>
          </div>

          {parent.linkedChildren.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {parent.linkedChildren.map((c) => (
                <Badge key={c.id} variant="secondary" className="text-[11px]">
                  {c.name} · {c.className} {c.section}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 md:flex-col">
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-3.5 w-3.5" />Back
          </Button>
          <Button size="sm" className="gap-1.5" onClick={() => navigate(`/parents/${parent.id}/edit`)}>
            <Pencil className="h-3.5 w-3.5" />Edit
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigate("/parents/parent-form/print")}>
            <Printer className="h-3.5 w-3.5" />Print
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="h-3.5 w-3.5" />Export
          </Button>
        </div>
      </div>
    </div>
  );
}
