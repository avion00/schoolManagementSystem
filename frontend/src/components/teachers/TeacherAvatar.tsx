function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return (parts[0][0] + (parts.at(-1)?.[0] ?? "")).toUpperCase();
}

export function TeacherAvatar({
  name,
  src,
  size = "md",
}: {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg";
}) {
  const cls = { sm: "h-7 w-7 text-[11px]", md: "h-9 w-9 text-[13px]", lg: "h-14 w-14 text-[18px]" }[size];

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${cls} rounded-full object-cover ring-2 ring-border`}
      />
    );
  }

  return (
    <span
      className={`${cls} inline-flex shrink-0 items-center justify-center rounded-full bg-secondary font-semibold leading-none text-secondary-foreground`}
    >
      {initials(name)}
    </span>
  );
}
