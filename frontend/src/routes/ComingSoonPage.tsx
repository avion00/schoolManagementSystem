import { type ComponentType } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface ComingSoonPageProps {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description?: string;
}

export function ComingSoonPage({ icon: Icon, title, description }: ComingSoonPageProps) {
  return (
    <Card className="border-border/60">
      <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
          <Icon className="h-7 w-7 text-muted-foreground" />
        </div>
        <div className="space-y-1.5">
          <p className="text-base font-semibold text-foreground">{title}</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            {description ??
              `The ${title.toLowerCase()} module is under development and will be available in an upcoming release.`}
          </p>
        </div>
        <Badge variant="outline" className="text-xs text-muted-foreground">
          Coming soon
        </Badge>
      </CardContent>
    </Card>
  );
}
