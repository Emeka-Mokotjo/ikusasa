import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Briefcase, CheckCircle2, FileSpreadsheet, Flag, ShieldCheck, Users } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { adminService } from "@/services";
import { initials, formatRelativeDate } from "@/lib/format";
import { OpportunityStatusPill } from "@/components/common/StatusPill";

export const Route = createFileRoute("/_authenticated/admin/dashboard")({
  head: () => ({ meta: [{ title: "Admin — Ikusasa" }] }),
  component: AdminDashboard,
});

function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  const w = 200;
  const h = 60;
  const step = w / (values.length - 1);
  const points = values.map((v, i) => `${i * step},${h - (v / max) * h}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-16 w-full">
      <polyline
        fill="none"
        stroke="currentColor"
        className="text-primary"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

function AdminDashboard() {
  const qc = useQueryClient();
  const { data: stats, isLoading } = useQuery({ queryKey: ["admin-stats"], queryFn: () => adminService.stats() });
  const { data: pending } = useQuery({ queryKey: ["admin-pending"], queryFn: () => adminService.pendingBusinesses() });
  const { data: recent } = useQuery({ queryKey: ["admin-recent-opps"], queryFn: () => adminService.recentOpportunities() });

  const approve = useMutation({
    mutationFn: (id: string) => adminService.approveBusiness(id),
    onSuccess: () => {
      toast.success("Business verified");
      qc.invalidateQueries({ queryKey: ["admin-pending"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });

  return (
    <AppShell title="Platform overview" description="Health of the Ikusasa marketplace at a glance.">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total users" value={isLoading ? "—" : String(stats?.totalUsers ?? 0)} hint={`${stats?.totalStudents ?? 0} students · ${stats?.totalGraduates ?? 0} grads`} icon={<Users className="h-4 w-4" />} />
        <StatCard label="Businesses" value={isLoading ? "—" : String(stats?.totalBusinesses ?? 0)} hint={`${stats?.pendingVerifications ?? 0} pending verification`} icon={<ShieldCheck className="h-4 w-4" />} />
        <StatCard label="Opportunities" value={isLoading ? "—" : String(stats?.totalOpportunities ?? 0)} hint={`${stats?.openOpportunities ?? 0} open`} icon={<Briefcase className="h-4 w-4" />} />
        <StatCard label="Applications" value={isLoading ? "—" : String(stats?.totalApplications ?? 0)} hint={`${stats?.flaggedItems ?? 0} flagged`} icon={<FileSpreadsheet className="h-4 w-4" />} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <article className="lg:col-span-2 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-elegant)]">
          <div className="flex items-baseline justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold tracking-tight">Signups · last 7 days</h2>
              <p className="text-sm text-muted-foreground">New users joining the platform.</p>
            </div>
            <p className="font-display text-2xl font-semibold">
              {stats?.signupsLast7Days.reduce((a, b) => a + b, 0) ?? 0}
            </p>
          </div>
          <div className="mt-4">
            {stats ? <Sparkline values={stats.signupsLast7Days} /> : <Skeleton className="h-16 w-full" />}
          </div>
        </article>

        <article className="rounded-2xl border border-foreground/10 bg-foreground p-5 text-background shadow-[var(--shadow-elegant)]">
          <div className="flex items-center gap-2">
            <Flag className="h-4 w-4 text-primary" />
            <h2 className="font-display text-lg font-semibold tracking-tight">Moderation queue</h2>
          </div>
          <p className="mt-1 text-sm text-background/70">Reports awaiting review.</p>
          <p className="mt-6 font-display text-5xl font-semibold">{stats?.flaggedItems ?? 0}</p>
          <Button asChild size="sm" variant="secondary" className="mt-6 w-full">
            <Link to="/admin/disputes">Open queue</Link>
          </Button>
        </article>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-elegant)]">
          <h2 className="font-display text-lg font-semibold tracking-tight">Business verifications</h2>
          <p className="text-sm text-muted-foreground">Approve businesses to let them post roles.</p>
          <ul className="mt-4 space-y-2">
            {!pending && Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
            {pending && pending.length === 0 && (
              <li className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Nothing waiting — nice work.
              </li>
            )}
            {pending?.map((b) => (
              <li key={b.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {initials(b.companyName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{b.companyName}</p>
                  <p className="truncate text-xs text-muted-foreground">{b.industry} · {b.city ?? "—"}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => approve.mutate(b.id)} disabled={approve.isPending}>
                  <CheckCircle2 className="mr-1 h-4 w-4" /> Verify
                </Button>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-elegant)]">
          <h2 className="font-display text-lg font-semibold tracking-tight">Recent opportunities</h2>
          <p className="text-sm text-muted-foreground">Latest postings across the marketplace.</p>
          <ul className="mt-4 space-y-2">
            {!recent && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
            {recent?.map((o) => (
              <li key={o.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                <div className="min-w-0 flex-1">
                  <Link
                    to="/opportunities/$opportunityId"
                    params={{ opportunityId: o.id }}
                    className="truncate text-sm font-semibold hover:text-primary"
                  >
                    {o.title}
                  </Link>
                  <p className="truncate text-xs text-muted-foreground">
                    {o.businessName} · {formatRelativeDate(o.postedAt)}
                  </p>
                </div>
                <OpportunityStatusPill status={o.status} />
              </li>
            ))}
          </ul>
        </article>
      </div>
    </AppShell>
  );
}
