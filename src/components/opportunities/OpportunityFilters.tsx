import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { OPPORTUNITY_TYPE_LABEL, SA_CITIES } from "@/constants";
import type { OpportunityFilters as Filters } from "@/services/opportunity.service";
import type { OpportunityType } from "@/types";

const TYPE_KEYS: OpportunityType[] = [
  "freelance",
  "internship",
  "part-time",
  "entry-level",
  "short-project",
];

export function OpportunityFiltersBar({
  filters,
  onChange,
}: {
  filters: Filters;
  onChange: (next: Filters) => void;
}) {
  const hasActive =
    !!filters.search ||
    !!filters.type ||
    filters.remote !== undefined ||
    !!filters.city;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-elegant)]">
      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto_auto] md:items-end">
        <div>
          <Label htmlFor="opp-search" className="text-xs">
            Search
          </Label>
          <div className="relative mt-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="opp-search"
              value={filters.search ?? ""}
              onChange={(e) => onChange({ ...filters, search: e.target.value || undefined })}
              placeholder="Search by title, company, or skill"
              className="pl-9"
            />
          </div>
        </div>

        <div className="min-w-[160px]">
          <Label className="text-xs">Type</Label>
          <Select
            value={filters.type ?? "all"}
            onValueChange={(v) =>
              onChange({ ...filters, type: v === "all" ? undefined : (v as OpportunityType) })
            }
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {TYPE_KEYS.map((t) => (
                <SelectItem key={t} value={t}>
                  {OPPORTUNITY_TYPE_LABEL[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-[160px]">
          <Label className="text-xs">Location</Label>
          <Select
            value={filters.city ?? "all"}
            onValueChange={(v) => onChange({ ...filters, city: v === "all" ? undefined : v })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Anywhere" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Anywhere</SelectItem>
              {SA_CITIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2.5">
          <Switch
            id="remote-only"
            checked={filters.remote === true}
            onCheckedChange={(checked) =>
              onChange({ ...filters, remote: checked ? true : undefined })
            }
          />
          <Label htmlFor="remote-only" className="text-sm">
            Remote only
          </Label>
        </div>

        {hasActive && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange({})}
            className="text-muted-foreground"
          >
            <X className="mr-1 h-4 w-4" /> Clear
          </Button>
        )}
      </div>
    </div>
  );
}
