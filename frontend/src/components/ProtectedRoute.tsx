import { Loader2 } from "lucide-react";
import { Navigate, Outlet } from "react-router-dom";

import { FirstPasswordChange } from "@/components/FirstPasswordChange";
import { useAuth } from "@/lib/auth";

export function ProtectedRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="grid h-screen place-items-center text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Accounts created with a one-time password must set their own first.
  if (user.must_change_password) return <FirstPasswordChange />;

  return <Outlet />;
}
