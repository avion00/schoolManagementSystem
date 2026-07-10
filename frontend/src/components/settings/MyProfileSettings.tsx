import { useNavigate } from "react-router-dom";

import { AccountHero } from "@/components/account/AccountHero";
import { AccountProfileCard } from "@/components/account/AccountProfileCard";

export function MyProfileSettings() {
  const navigate = useNavigate();
  return (
    <div className="space-y-4">
      <AccountHero
        onEditProfile={() => navigate("/settings/my-profile")}
        onSecuritySettings={() => navigate("/settings/my-security")}
      />
      <AccountProfileCard />
    </div>
  );
}
