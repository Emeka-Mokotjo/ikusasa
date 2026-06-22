import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function TagInput({
  value,
  onChange,
  suggestions = [],
  placeholder = "Type and press Enter",
  className,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
  className?: string;
}) {
  const [draft, setDraft] = useState("");

  function add(tag: string) {
    const t = tag.trim();
    if (!t) return;
    if (value.includes(t)) return;
    onChange([...value, t]);
    setDraft("");
  }
  function remove(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }
  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(draft);
    } else if (e.key === "Backspace" && !draft && value.length) {
      remove(value[value.length - 1]);
    }
  }

  const available = suggestions.filter((s) => !value.includes(s)).slice(0, 8);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex min-h-11 flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-2 py-1.5 focus-within:ring-2 focus-within:ring-ring/40">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground"
          >
            {tag}
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              onClick={() => remove(tag)}
              className="rounded-full p-0.5 hover:bg-foreground/10"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
          placeholder={value.length === 0 ? placeholder : ""}
          className="flex-1 min-w-32 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
      {available.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {available.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="rounded-full border border-border bg-card px-2.5 py-0.5 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
