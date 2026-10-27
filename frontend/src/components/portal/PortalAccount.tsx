import { AccountProfileCard } from "@/components/account/AccountProfileCard";
import { ActiveSessionsCard } from "@/components/account/ActiveSessionsCard";
import { SecurityOverviewCard } from "@/components/account/SecurityOverviewCard";
import { PortalHeader } from "./PortalViews";

/** My account for every portal: profile, password and signed-in devices. */
export function PortalAccount({ extra }: { extra?: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <PortalHeader title="My Account" description="Your profile, password and signed-in devices." />
      <div className="grid gap-4 lg:grid-cols-2">
        <AccountProfileCard />
        <SecurityOverviewCard onManageSessions={() => document.getElementById("sessions")?.scrollIntoView({ behavior: "smooth" })} />
      </div>
      {extra}
      <div id="sessions"><ActiveSessionsCard /></div>
    </div>
  );
}
