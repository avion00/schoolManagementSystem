import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface AvatarGroupItem {
  id: string | number;
  name: string;
  imageUrl?: string;
}

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.length ? (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase() : "?";
}

const SIZE_CLASS = { sm: "h-6 w-6 text-[9px]", md: "h-8 w-8 text-[10.5px]", lg: "h-10 w-10 text-[12px]" };

/** Static overlapping avatar stack (no hover animation). For an animated,
 *  interactive version see components/motion/AvatarGroupHover. */
export function AvatarGroup({
  items,
  maxVisible = 4,
  size = "md",
  overlap = 10,
  className,
}: {
  items: AvatarGroupItem[];
  maxVisible?: number;
  size?: "sm" | "md" | "lg";
  overlap?: number;
  className?: string;
}) {
  const visible = items.slice(0, maxVisible);
  const overflow = items.length - visible.length;

  return (
    <div className={cn("flex items-center", className)}>
      {visible.map((item, i) => (
        <Avatar key={item.id} className={cn(SIZE_CLASS[size], "ring-2 ring-card")} style={{ marginLeft: i === 0 ? 0 : -overlap, zIndex: visible.length - i }}>
          {item.imageUrl && <AvatarImage src={item.imageUrl} alt={item.name} />}
          <AvatarFallback className={SIZE_CLASS[size]}>{initialsOf(item.name)}</AvatarFallback>
        </Avatar>
      ))}
      {overflow > 0 && (
        <span
          className={cn("flex shrink-0 items-center justify-center rounded-full bg-muted font-medium text-muted-foreground ring-2 ring-card", SIZE_CLASS[size])}
          style={{ marginLeft: -overlap }}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
}
