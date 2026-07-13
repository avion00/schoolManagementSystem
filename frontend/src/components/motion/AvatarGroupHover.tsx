import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface AvatarGroupHoverItem {
  id: string | number;
  name: string;
  imageUrl?: string;
}

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.length ? (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase() : "?";
}

const SIZE_CLASS = { sm: "h-6 w-6 text-[9px]", md: "h-8 w-8 text-[10.5px]", lg: "h-10 w-10 text-[12px]" };

/**
 * Overlapping avatar stack that gently spreads apart on hover. Use for group
 * members, class rosters, message participants, teacher teams.
 */
export function AvatarGroupHover({
  items,
  maxVisible = 4,
  size = "md",
  overlap = 10,
  onItemClick,
  className,
}: {
  items: AvatarGroupHoverItem[];
  maxVisible?: number;
  size?: "sm" | "md" | "lg";
  overlap?: number;
  onItemClick?: (item: AvatarGroupHoverItem) => void;
  className?: string;
}) {
  const visible = items.slice(0, maxVisible);
  const overflow = items.length - visible.length;

  return (
    <div className={cn("t-avatar-group flex items-center", className)}>
      {visible.map((item, i) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onItemClick?.(item)}
          className="t-avatar-item relative rounded-full ring-2 ring-card transition-transform hover:z-10 hover:scale-110"
          style={{ marginLeft: i === 0 ? 0 : -overlap, zIndex: visible.length - i, "--avatar-spread-offset": `${i * 3}px` } as React.CSSProperties}
          title={item.name}
        >
          <Avatar className={SIZE_CLASS[size]}>
            {item.imageUrl && <AvatarImage src={item.imageUrl} alt={item.name} />}
            <AvatarFallback className={SIZE_CLASS[size]}>{initialsOf(item.name)}</AvatarFallback>
          </Avatar>
        </button>
      ))}
      {overflow > 0 && (
        <span
          className={cn(
            "relative flex shrink-0 items-center justify-center rounded-full bg-muted font-medium text-muted-foreground ring-2 ring-card",
            SIZE_CLASS[size],
          )}
          style={{ marginLeft: -overlap }}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
}
