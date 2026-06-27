import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Compass } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { OpportunityCard } from "@/components/opportunities/OpportunityCard";
import { OpportunityFiltersBar } from "@/components/opportunities/OpportunityFilters";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { opportunityService, type OpportunityFilters } from "@/services/opportunity.service";

export const Route = createFileRoute("/_authenticated/opportunities/")({
  head: () => ({
    meta: [
      { title: "Browse opportunities — Ikusasa" },
      {
        name: "description",
        content: "Discover internships, freelance gigs and entry-level roles across South Africa.",
      },
    ],
  }),
  component: OpportunitiesPage,
});

function OpportunitiesPage() {
  const [filters, setFilters] = useState<OpportunityFilters>({});
  const { data, isLoading } = useQuery({
    queryKey: ["opportunities", filters],
    queryFn: () => opportunityService.list(filters),
  });

  return (
    <AppShell
      title="Find your next opportunity"
      description="Freelance, internships, and entry-level work — handpicked for emerging talent."
    >
      <div className="space-y-6">
        <OpportunityFiltersBar filters={filters} onChange={setFilters} />

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Loading…" : `${data?.length ?? 0} opportunities`}
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : data && data.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {data.map((opp) => (
              <OpportunityCard key={opp.id} opp={opp} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Compass className="h-8 w-8" />}
            title="No opportunities match those filters"
            description="Try clearing some filters or broadening your search."
          />
        )}
      </div>
    </AppShell>
  );
}
