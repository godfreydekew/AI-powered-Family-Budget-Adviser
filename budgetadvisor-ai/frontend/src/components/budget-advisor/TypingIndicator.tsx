export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-2 rounded-full bg-muted-foreground/40"
          style={{
            animation: "advisor-dot-pulse 1.2s ease-in-out infinite",
            animationDelay: `${i * 400}ms`,
          }}
        />
      ))}
    </div>
  );
}
