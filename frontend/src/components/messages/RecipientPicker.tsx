import { useMemo, useState } from "react";
import { Check } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CHAT_USERS, type ChatRole } from "@/data/messagesData";
import { canRolesMessage } from "@/data/messagePermissions";
import { cn } from "@/lib/utils";

const ROLE_FILTERS: (ChatRole | "All")[] = ["All", "Student", "Parent", "Teacher", "Staff", "Admin", "Principal"];

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.length ? (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase() : "?";
}

export function RecipientPicker({
  currentUserId,
  currentUserRole,
  selected,
  onChange,
  multiple = true,
}: {
  currentUserId: string;
  currentUserRole: ChatRole;
  selected: string[];
  onChange: (ids: string[]) => void;
  multiple?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<ChatRole | "All">("All");

  const candidates = useMemo(() => {
    return CHAT_USERS.filter((u) => {
      if (u.id === currentUserId) return false;
      if (!canRolesMessage(currentUserRole, u.role)) return false;
      if (roleFilter !== "All" && u.role !== roleFilter) return false;
      if (search.trim() && !u.name.toLowerCase().includes(search.trim().toLowerCase())) return false;
      return true;
    });
  }, [currentUserId, currentUserRole, roleFilter, search]);

  function toggle(id: string) {
    if (!multiple) {
      onChange([id]);
      return;
    }
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  }

  return (
    <div className="space-y-2.5">
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name..."
        className="h-9 w-full rounded-xl border border-input bg-background px-3 text-[13px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-ring"
      />
      <div className="flex flex-wrap gap-1.5">
        {ROLE_FILTERS.map((r) => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className={cn(
              "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
              roleFilter === r ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground hover:bg-muted",
            )}
          >
            {r === "All" ? "All" : `${r}s`}
          </button>
        ))}
      </div>
      <div className="max-h-64 space-y-0.5 overflow-y-auto rounded-xl border border-border/60 p-1.5">
        {candidates.length === 0 ? (
          <p className="px-2 py-4 text-center text-[12px] text-muted-foreground">No matching users.</p>
        ) : (
          candidates.map((u) => {
            const isSelected = selected.includes(u.id);
            return (
              <button
                key={u.id}
                onClick={() => toggle(u.id)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors",
                  isSelected ? "bg-primary/[0.08]" : "hover:bg-muted",
                )}
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="text-[10.5px]">{initialsOf(u.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-medium text-foreground">{u.name}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{u.role}</p>
                </div>
                {isSelected && <Check className="h-4 w-4 shrink-0 text-primary" />}
              </button>
            );
          })
        )}
      </div>
      {multiple && selected.length > 0 && (
        <p className="text-[11.5px] text-muted-foreground">{selected.length} recipient{selected.length !== 1 ? "s" : ""} selected</p>
      )}
    </div>
  );
}
