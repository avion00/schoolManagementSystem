import { Search } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function SearchPage() {
  return (
    <Card className="border-border/60">
      <CardContent className="flex flex-col items-center py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Search className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="mt-4 text-sm font-medium text-foreground">Coming soon</p>
        <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
          Full-text search across students, records, fees, and the entire platform will be available here.
        </p>
      </CardContent>
    </Card>
  );
}
