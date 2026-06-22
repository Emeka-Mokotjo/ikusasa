import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  Check,
  Clock,
  MapPin,
  Share2,
  Users,
  Wifi,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApplyDialog } from "@/components/opportunities/ApplyDialog";
import { opportunityService } from "@/services";
import { formatDate, formatRelativeDate, formatZAR, initials } from "@/lib/format";
import { OPPORTUNITY_TYPE_LABEL } from "@/constants";
import { useAuthStore } from "@/store";

export const Route = createFileRoute("/opportunities/$opportunityId")({
  head: () => ({
    meta: [{ title: "Opportunity — Ikusasa" }],
  }),
  component: OpportunityDetail,
  notFoundComponent: () => (
    <AppShell title="Opportunity not found">
      <p className="text-muted-foreground">
        This opportunity may have closed.{" "}
        <Link to="/opportunities" className="text-primary underline">
          Browse open roles
        </Link>
        .
      </p>
    </AppShell>
  ),
});

function OpportunityDetail() {
  const { opportunityId } = Route.useParams();
  const user = useAuthStore((s) => s.user);
  const [applyOpen, setApplyOpen] = useState(false);

  const { data: opp, isLoading } = useQuery({
    queryKey: ["opportunity", opportunityId],
    queryFn: async () => {
      const o = await opportunityService.byId(opportunityId);
      if (!o) throw notFound();
      return o;
    },
  });

  if (isLoading) {
    return (
      <AppShell>
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </AppShell>
    );
  }
  if (!opp) return null;

  const isBusiness = user?.role === "business";

  return (
    <AppShell>
      <Link
        to="/opportunities"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to marketplace
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <article className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-elegant)] sm:p-8">
          <div className="flex items-start gap-4">
            <Avatar className="h-14 w-14 shrink-0">
              <AvatarFallback className="bg-accent text-accent-foreground text-base font-semibold">
                {initials(opp.businessName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-medium text-muted-foreground">{opp.businessName}</p>
              <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {opp.title}
              </h1>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Badge variant="secondary" className="rounded-full">
                  {OPPORTUNITY_TYPE_LABEL[opp.type]}
                </Badge>
                {opp.remote && (
                  <Badge variant="outline" className="rounded-full gap-1">
                    <Wifi className="h-3 w-3" /> Remote
                  </Badge>
                )}
                <Badge variant="outline" className="rounded-full gap-1">
                  <MapPin className="h-3 w-3" /> {opp.location}
                </Badge>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-6">
            <section>
              <h2 className="font-display text-base font-semibold">About this role</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {opp.description}
              </p>
            </section>

            <section>
              <h2 className="font-display text-base font-semibold">What we're looking for</h2>
              <ul className="mt-2 space-y-2">
                {opp.requirements.map((r) => (
                  <li key={r} className="flex gap-2 text-sm text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="font-display text-base font-semibold">Skills</h2>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {opp.skills.map((s) => (
                  <Badge key={s} variant="outline" className="rounded-full">
                    {s}
                  </Badge>
                ))}
              </div>
            </section>
          </div>
        </article>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-elegant)]">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Compensation
            </p>
            <p className="mt-1 font-display text-3xl font-semibold tracking-tight text-foreground">
              {formatZAR(opp.compensationAmount)}
            </p>
            <p className="text-xs text-muted-foreground">
              {opp.compensationType === "hourly"
                ? "Per hour"
                : opp.compensationType === "stipend"
                  ? "Monthly stipend"
                  : opp.compensationType === "unpaid"
                    ? "Unpaid / equity"
                    : "Fixed for the project"}
            </p>

            <div className="mt-5 space-y-3 border-t border-border pt-5 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Briefcase className="h-4 w-4" />
                <span>{opp.durationWeeks} weeks</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Apply by {formatDate(opp.deadline)}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{opp.applicantCount} applicants</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Posted {formatRelativeDate(opp.postedAt)}</span>
              </div>
            </div>

            <div className="mt-6 grid gap-2">
              <Button
                size="lg"
                className="w-full shadow-[var(--shadow-coral)]"
                onClick={() => setApplyOpen(true)}
                disabled={isBusiness}
              >
                {isBusiness ? "Businesses can't apply" : "Apply now"}
              </Button>
              <Button variant="outline" size="lg" className="w-full">
                <Share2 className="mr-2 h-4 w-4" /> Share
              </Button>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              About the company
            </p>
            <p className="mt-2 font-display text-base font-semibold">{opp.businessName}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Verified employer on Ikusasa. View their full profile to see other opportunities and
              reviews.
            </p>
          </div>
        </aside>
      </div>

      <ApplyDialog open={applyOpen} onOpenChange={setApplyOpen} opp={opp} />
    </AppShell>
  );
}
