import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  value,
  size = 16,
  showValue = false,
  onChange,
  className,
}: {
  value: number;
  size?: number;
  showValue?: boolean;
  onChange?: (v: number) => void;
  className?: string;
}) {
  const interactive = !!onChange;
  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((n) => {
          const filled = n <= Math.round(value);
          const StarEl = (
            <Star
              style={{ width: size, height: size }}
              className={cn(
                filled ? "fill-primary text-primary" : "fill-transparent text-muted-foreground/40",
                interactive && "transition-transform hover:scale-110"
              )}
            />
          );
          return interactive ? (
            <button
              key={n}
              type="button"
              aria-label={`Rate ${n} star${n === 1 ? "" : "s"}`}
              onClick={() => onChange(n)}
              className="p-0.5"
            >
              {StarEl}
            </button>
          ) : (
            <span key={n}>{StarEl}</span>
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm font-medium text-foreground">{value.toFixed(1)}</span>
      )}
    </div>
  );
}
