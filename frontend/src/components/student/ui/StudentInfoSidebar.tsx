import type { ReactNode } from "react";

/** Content wrapper for the right-column context area — passed as `sidebar` to StudentTwoColumnLayout. */
export function StudentInfoSidebar({ children }: { children: ReactNode }) {
  return <div className="space-y-4">{children}</div>;
}
