const PALETTE = [
  "bg-teal-500 text-white",
  "bg-purple-500 text-white",
  "bg-sky-500 text-white",
  "bg-orange-500 text-white",
  "bg-rose-500 text-white",
  "bg-lime-600 text-white",
  "bg-indigo-500 text-white",
  "bg-pink-500 text-white",
];

function colorIndex(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return h % PALETTE.length;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return (parts[0][0] + (parts.at(-1)?.[0] ?? "")).toUpperCase();
}

export function ParentAvatar({
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
      <img src={src} alt={name}
        className={`${cls} rounded-full object-cover ring-2 ring-border`} />
    );
  }

  return (
    <span
      className={`${cls} ${PALETTE[colorIndex(name)]} inline-flex shrink-0 items-center justify-center rounded-full font-semibold leading-none`}
    >
      {initials(name)}
    </span>
  );
}
