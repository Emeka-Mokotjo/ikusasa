import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Logo({ className, withWordmark = true }: { className?: string; withWordmark?: boolean }) {
  return (
    <Link to="/" className={cn("inline-flex items-center gap-2", className)} aria-label="Ikusasa home">
      <span
        aria-hidden
        className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground font-display text-lg font-bold shadow-[var(--shadow-coral)]"
      >
        i
      </span>
      {withWordmark && (
        <span className="font-display text-lg font-semibold tracking-tight text-foreground">
          Ikusasa
        </span>
      )}
    </Link>
  );
}
