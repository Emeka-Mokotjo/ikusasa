import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Bell, Briefcase, CheckCircle2, FileText, Sparkles, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/dashboard/StatCard";
import { OpportunityCard } from "@/components/opportunities/OpportunityCard";
import { ApplicationStatusPill } from "@/components/common/StatusPill";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { applicationService, notificationService, opportunityService } from "@/services";
import { useAuthStore } from "@/store";
import { formatRelativeDate } from "@/lib/format";

export const Route = createFileRoute("/student/dashboard")({
  head: () => ({ meta: [{ title: "Student dashboard — Ikusasa" }] }),
  component: () => <TalentDashboard role="Student" />,
});

export function TalentDashboard({ role }: { role: "Student" | "Graduate" }) {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id ?? "stu_1";

  const { data: opps, isLoading: oppsLoading } = useQuery({
    queryKey: ["recommended", userId],
    queryFn: () => opportunityService.recommended(userId, 4),
  });
  const { data: apps } = useQuery({
    queryKey: ["my-applications", userId],
    queryFn: () => applicationService.byApplicantId(userId),
  });
  const { data: notifs } = useQuery({
    queryKey: ["notifications", userId],
    queryFn: () => notificationService.byUserId(userId),
  });

  const activeApps = apps?.filter((a) => !["rejected", "withdrawn"].includes(a.status)).length ?? 0;
  const shortlisted = apps?.filter((a) => ["shortlisted", "interview", "accepted"].includes(a.status)).length ?? 0;
  const unreadNotifs = notifs?.filter((n) => !n.read).length ?? 0;

  const firstName = user?.fullName?.split(" ")[0] ?? role;

  return (
    <AppShell
      title={`Welcome back, ${firstName}`}
      description={`Here's what's happening on your ${role.toLowerCase()} dashboard today.`}
      actions={
        <Button asChild>
          <Link to="/opportunities">
            Browse marketplace <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </Button>
      }
    >
      {/* Bento grid */}
      <div className="grid auto-rows-min gap-4 lg:grid-cols-4">
        <StatCard
          label="Active applications"
          value={activeApps}
          hint="In flight right now"
          icon={<FileText className="h-4 w-4" />}
        />
        <StatCard
          label="Shortlisted"
          value={shortlisted}
          hint="Companies want to talk"
          icon={<CheckCircle2 className="h-4 w-4" />}
          tone="primary"
        />
        <StatCard
          label="Profile views"
          value="48"
          hint="This week, +12%"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard
          label="Unread updates"
          value={unreadNotifs}
          hint="Notifications waiting"
          icon={<Bell className="h-4 w-4" />}
          tone="dark"
        />

        {/* Recommended — wide tile */}
        <section className="lg:col-span-3 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-elegant)]">
          <header className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold">Recommended for you</h2>
              <p className="text-sm text-muted-foreground">Matched to your skills and interests.</p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/opportunities">
                See all <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </header>
          {oppsLoading ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-56 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {opps?.map((o) => <OpportunityCard key={o.id} opp={o} />)}
            </div>
          )}
        </section>

        {/* Notifications */}
        <aside className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-elegant)]">
          <header className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="font-display text-sm font-semibold">Recent activity</h2>
          </header>
          {notifs && notifs.length > 0 ? (
            <ul className="space-y-3">
              {notifs.slice(0, 5).map((n) => (
                <li key={n.id} className="rounded-xl border border-border bg-background p-3">
                  <p className="text-sm font-medium text-foreground">{n.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.body}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                    {formatRelativeDate(n.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">All quiet for now.</p>
          )}
        </aside>

        {/* Recent applications — wide */}
        <section className="lg:col-span-4 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-elegant)]">
          <header className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold">Recent applications</h2>
              <p className="text-sm text-muted-foreground">Track where you stand.</p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/student/applications">
                Manage all <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </header>
          {apps && apps.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Role</th>
                    <th className="py-2 pr-4 font-medium">Company</th>
                    <th className="py-2 pr-4 font-medium">Submitted</th>
                    <th className="py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {apps.slice(0, 5).map((a) => (
                    <tr key={a.id} className="border-b border-border/60 last:border-0">
                      <td className="py-3 pr-4 font-medium text-foreground">{a.opportunityTitle}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{a.businessName}</td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {formatRelativeDate(a.submittedAt)}
                      </td>
                      <td className="py-3">
                        <ApplicationStatusPill status={a.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={<Briefcase className="h-7 w-7" />}
              title="No applications yet"
              description="When you apply to an opportunity it'll show up here."
              action={
                <Button asChild>
                  <Link to="/opportunities">Find opportunities</Link>
                </Button>
              }
            />
          )}
        </section>
      </div>
    </AppShell>
  );
}
