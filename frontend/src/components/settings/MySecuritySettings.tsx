import { useNavigate } from "react-router-dom";

import { SecurityOverviewCard } from "@/components/account/SecurityOverviewCard";

export function MySecuritySettings() {
  const navigate = useNavigate();
  return <SecurityOverviewCard onManageSessions={() => navigate("/settings/my-sessions")} />;
}
