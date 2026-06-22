import { useState, useRef, type DragEvent } from "react";
import { Upload, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function FileDropzone({
  value,
  onChange,
  accept = ".pdf,.doc,.docx",
  hint = "PDF or DOC up to 5MB",
  multiple = false,
  className,
}: {
  value?: string | string[];
  onChange: (files: string | string[]) => void;
  accept?: string;
  hint?: string;
  multiple?: boolean;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  function handleFiles(list: FileList | null) {
    if (!list || !list.length) return;
    const names = Array.from(list).map((f) => f.name);
    if (multiple) {
      const prev = Array.isArray(value) ? value : [];
      onChange([...prev, ...names]);
    } else {
      onChange(names[0]);
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDrag(false);
    handleFiles(e.dataTransfer.files);
  }

  const files = multiple ? (Array.isArray(value) ? value : []) : value ? [value as string] : [];

  return (
    <div className={cn("space-y-2", className)}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed bg-card px-6 py-10 text-center transition",
          drag ? "border-primary bg-accent/40" : "border-border hover:border-primary/50"
        )}
      >
        <Upload className="h-6 w-6 text-muted-foreground" aria-hidden />
        <p className="text-sm font-medium text-foreground">
          <span className="text-primary">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-muted-foreground">{hint}</p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {files.length > 0 && (
        <ul className="space-y-1.5">
          {files.map((name) => (
            <li
              key={name}
              className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2"
            >
              <div className="flex min-w-0 items-center gap-2">
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                <span className="truncate text-sm">{name}</span>
              </div>
              <button
                type="button"
                aria-label={`Remove ${name}`}
                onClick={() => {
                  if (multiple) {
                    onChange(files.filter((f) => f !== name));
                  } else {
                    onChange("");
                  }
                }}
                className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
