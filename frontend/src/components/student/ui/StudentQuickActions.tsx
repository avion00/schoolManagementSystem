import type { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { StudentActionButton } from "@/components/student/ui/StudentActionButton";

export interface StudentQuickAction {
  label: string;
  icon: LucideIcon;
  to?: string;
  onClick?: () => void;
}

/** Responsive grid of icon action buttons — reused by the hero card and any page needing quick actions. */
export function StudentQuickActions({ actions }: { actions: StudentQuickAction[] }) {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
      {actions.map((action) => (
        <StudentActionButton
          key={action.label}
          label={action.label}
          icon={action.icon}
          onClick={() => (action.onClick ? action.onClick() : action.to && navigate(action.to))}
        />
      ))}
    </div>
  );
}
