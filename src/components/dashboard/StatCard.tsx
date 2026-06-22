import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "default",
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  tone?: "default" | "primary" | "dark";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-5 shadow-[var(--shadow-elegant)]",
        tone === "primary" && "border-primary/20 bg-primary/5",
        tone === "dark" && "border-transparent bg-foreground text-background",
        tone === "default" && "border-border bg-card",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p
          className={cn(
            "text-xs font-medium",
            tone === "dark" ? "text-background/70" : "text-muted-foreground"
          )}
        >
          {label}
        </p>
        {icon && (
          <span
            className={cn(
              "grid h-8 w-8 place-items-center rounded-lg",
              tone === "dark" ? "bg-background/10 text-background" : "bg-accent text-accent-foreground"
            )}
          >
            {icon}
          </span>
        )}
      </div>
      <p className="mt-3 font-display text-3xl font-semibold tracking-tight">{value}</p>
      {hint && (
        <p
          className={cn(
            "mt-1 text-xs",
            tone === "dark" ? "text-background/60" : "text-muted-foreground"
          )}
        >
          {hint}
        </p>
      )}
    </div>
  );
}
