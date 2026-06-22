import { cn } from "@/lib/utils";

export function Stepper({
  steps,
  current,
  className,
}: {
  steps: string[];
  current: number;
  className?: string;
}) {
  return (
    <ol className={cn("flex items-center gap-2", className)}>
      {steps.map((label, i) => {
        const idx = i + 1;
        const state =
          idx < current ? "done" : idx === current ? "active" : "pending";
        return (
          <li key={label} className="flex flex-1 items-center gap-2 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={cn(
                  "grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-semibold transition",
                  state === "active" && "bg-primary text-primary-foreground",
                  state === "done" && "bg-success text-success-foreground",
                  state === "pending" && "bg-muted text-muted-foreground"
                )}
                aria-current={state === "active" ? "step" : undefined}
              >
                {idx}
              </span>
              <span
                className={cn(
                  "hidden truncate text-sm font-medium sm:inline",
                  state === "pending" ? "text-muted-foreground" : "text-foreground"
                )}
              >
                {label}
              </span>
            </div>
            {idx < steps.length && (
              <span
                aria-hidden
                className={cn(
                  "h-px flex-1 rounded-full",
                  state === "done" ? "bg-success/40" : "bg-border"
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
