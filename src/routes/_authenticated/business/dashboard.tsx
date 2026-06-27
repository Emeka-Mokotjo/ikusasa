import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Briefcase,
  Eye,
  PlusCircle,
  Sparkles,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/dashboard/StatCard";
import { ApplicationStatusPill } from "@/components/common/StatusPill";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { applicationService, opportunityService } from "@/services";
import { useAuthStore } from "@/store";
import { formatRelativeDate, formatZAR, initials } from "@/lib/format";
import { OPPORTUNITY_TYPE_LABEL } from "@/constants";

export const Route = createFileRoute("/_authenticated/business/dashboard")({
  head: () => ({ meta: [{ title: "Business dashboard — Ikusasa" }] }),
  component: BusinessDashboard,
});

function BusinessDashboard() {
  const user = useAuthStore((s) => s.user);
  const businessId = user?.id ?? "biz_1";

  const { data: opps, isLoading: oppsLoading } = useQuery({
    queryKey: ["business-opps", businessId],
    queryFn: () => opportunityService.byBusinessId("biz_1"),
  });
  const { data: apps } = useQuery({
    queryKey: ["business-apps", businessId],
    queryFn: () => applicationService.byBusinessId(businessId),
  });

  const openCount = opps?.filter((o) => o.status === "open").length ?? 0;
  const totalApplicants = opps?.reduce((sum, o) => sum + o.applicantCount, 0) ?? 0;
  const newApps = apps?.filter((a) => a.status === "submitted").length ?? 0;

  const firstName = user?.fullName?.split(" ")[0] ?? "there";

  return (
    <AppShell
      title={`Hello, ${firstName}`}
      description="Manage your open roles, applicants, and pipeline."
      actions={
        <Button asChild className="shadow-[var(--shadow-coral)]">
          <Link to="/business/opportunities/new">
            <PlusCircle className="mr-1.5 h-4 w-4" /> Post a role
          </Link>
        </Button>
      }
    >
      <div className="grid auto-rows-min gap-4 lg:grid-cols-4">
        <StatCard
          label="Open roles"
          value={openCount}
          hint="Currently accepting applications"
          icon={<Briefcase className="h-4 w-4" />}
        />
        <StatCard
          label="Total applicants"
          value={totalApplicants}
          hint="Across all roles"
          icon={<Users className="h-4 w-4" />}
          tone="primary"
        />
        <StatCard
          label="New this week"
          value={newApps}
          hint="Awaiting your review"
          icon={<Sparkles className="h-4 w-4" />}
        />
        <StatCard
          label="Profile rating"
          value="4.8"
          hint="From 12 completed projects"
          icon={<Star className="h-4 w-4" />}
          tone="dark"
        />

        {/* Open opportunities */}
        <section className="lg:col-span-3 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-elegant)]">
          <header className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold">Your opportunities</h2>
              <p className="text-sm text-muted-foreground">What you have live on Ikusasa.</p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/business/opportunities">
                Manage all <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </header>
          {oppsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : opps && opps.length > 0 ? (
            <ul className="divide-y divide-border">
              {opps.map((o) => (
                <li key={o.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
                    <div className="min-w-0">
                      <Link
                        to="/opportunities/$opportunityId"
                        params={{ opportunityId: o.id }}
                        className="truncate font-medium text-foreground hover:text-primary"
                      >
                        {o.title}
                      </Link>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        <Badge variant="secondary" className="rounded-full text-xs">
                          {OPPORTUNITY_TYPE_LABEL[o.type]}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {o.applicantCount} applicants · posted {formatRelativeDate(o.postedAt)}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-display text-sm font-semibold">
                        {formatZAR(o.compensationAmount, { compact: true })}
                      </p>
                      <Button variant="ghost" size="sm" asChild className="mt-1 h-7 px-2 text-xs">
                        <Link to="/opportunities/$opportunityId" params={{ opportunityId: o.id }}>
                          <Eye className="mr-1 h-3 w-3" /> View
                        </Link>
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={<Briefcase className="h-7 w-7" />}
              title="No roles posted yet"
              description="Post your first opportunity to start receiving applications."
              action={
                <Button asChild>
                  <Link to="/business/opportunities/new">Post a role</Link>
                </Button>
              }
            />
          )}
        </section>

        {/* Hire health */}
        <aside className="rounded-2xl border border-transparent bg-foreground p-5 text-background shadow-[var(--shadow-elegant)]">
          <header className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h2 className="font-display text-sm font-semibold">Hiring health</h2>
          </header>
          <p className="mt-4 font-display text-4xl font-semibold">87%</p>
          <p className="text-xs text-background/60">
            Time-to-first-response in the last 14 days. Keep it under 48h to stay above 90%.
          </p>
          <div className="mt-5 space-y-2 text-xs text-background/70">
            <div className="flex justify-between">
              <span>Median time to shortlist</span>
              <span className="font-medium text-background">3 days</span>
            </div>
            <div className="flex justify-between">
              <span>Acceptance rate</span>
              <span className="font-medium text-background">62%</span>
            </div>
          </div>
        </aside>

        {/* Recent applicants */}
        <section className="lg:col-span-4 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-elegant)]">
          <header className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold">Recent applicants</h2>
              <p className="text-sm text-muted-foreground">New people interested in your roles.</p>
            </div>
          </header>
          {apps && apps.length > 0 ? (
            <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {apps.slice(0, 6).map((a) => (
                <li
                  key={a.id}
                  className="rounded-xl border border-border bg-background p-4"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {initials(a.applicantName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {a.applicantName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {a.opportunityTitle}
                      </p>
                      <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                        {a.coverMessage}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <ApplicationStatusPill status={a.status} />
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          {formatRelativeDate(a.submittedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No applicants yet" description="Once people apply, they'll appear here." />
          )}
        </section>
      </div>
    </AppShell>
  );
}
