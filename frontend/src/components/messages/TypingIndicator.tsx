export function TypingIndicator({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 px-1 py-1 text-[12px] text-muted-foreground">
      <span className="flex items-center gap-0.5">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50" />
      </span>
      <span>{label}</span>
    </div>
  );
}
