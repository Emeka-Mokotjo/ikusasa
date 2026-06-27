import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Eye, PlusCircle, Users } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { OpportunityStatusPill } from "@/components/common/StatusPill";
import { opportunityService } from "@/services";
import { useAuthStore } from "@/store";
import { OPPORTUNITY_TYPE_LABEL } from "@/constants";
import { formatRelativeDate, formatZAR } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/business/opportunities/")({
  head: () => ({ meta: [{ title: "Your opportunities — Ikusasa" }] }),
  component: BusinessOpportunitiesPage,
});

function BusinessOpportunitiesPage() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading } = useQuery({
    queryKey: ["business-opps", user?.id ?? "biz_1"],
    queryFn: () => opportunityService.byBusinessId("biz_1"),
  });

  return (
    <AppShell
      title="Your opportunities"
      description="Manage every role you've posted on Ikusasa."
      actions={
        <Button asChild className="shadow-[var(--shadow-coral)]">
          <Link to="/business/opportunities/new">
            <PlusCircle className="mr-1.5 h-4 w-4" /> Post a role
          </Link>
        </Button>
      }
    >
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      ) : data && data.length > 0 ? (
        <div className="space-y-3">
          {data.map((o) => (
            <article
              key={o.id}
              className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-elegant)]"
            >
              <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-base font-semibold text-foreground">
                      {o.title}
                    </h3>
                    <OpportunityStatusPill status={o.status} />
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <Badge variant="secondary" className="rounded-full text-xs">
                      {OPPORTUNITY_TYPE_LABEL[o.type]}
                    </Badge>
                    {o.skills.slice(0, 3).map((s) => (
                      <Badge key={s} variant="outline" className="rounded-full text-xs">
                        {s}
                      </Badge>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Posted {formatRelativeDate(o.postedAt)} ·{" "}
                    <Users className="inline h-3 w-3" /> {o.applicantCount} applicants ·{" "}
                    {formatZAR(o.compensationAmount, { compact: true })}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/opportunities/$opportunityId" params={{ opportunityId: o.id }}>
                      <Eye className="mr-1 h-3.5 w-3.5" /> View
                    </Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link
                      to="/business/opportunities/$opportunityId/applicants"
                      params={{ opportunityId: o.id }}
                    >
                      <Users className="mr-1 h-3.5 w-3.5" /> Applicants
                    </Link>
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No roles posted yet"
          description="Post your first role to start receiving applications."
          action={
            <Button asChild>
              <Link to="/business/opportunities/new">Post a role</Link>
            </Button>
          }
        />
      )}
    </AppShell>
  );
}
