import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Briefcase } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ApplicationStatusPill } from "@/components/common/StatusPill";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { applicationService } from "@/services";
import { useAuthStore } from "@/store";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/student/applications")({
  head: () => ({ meta: [{ title: "My applications — Ikusasa" }] }),
  component: ApplicationsPage,
});

function ApplicationsPage() {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id ?? "stu_1";
  const { data, isLoading } = useQuery({
    queryKey: ["my-applications", userId],
    queryFn: () => applicationService.byApplicantId(userId),
  });

  return (
    <AppShell
      title="My applications"
      description="Every role you've applied to, in one place."
    >
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : data && data.length > 0 ? (
        <div className="space-y-3">
          {data.map((a) => (
            <article
              key={a.id}
              className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-elegant)]"
            >
              <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{a.businessName}</p>
                  <h3 className="font-display text-base font-semibold text-foreground">
                    {a.opportunityTitle}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{a.coverMessage}</p>
                </div>
                <div className="flex flex-col items-start gap-2 sm:items-end">
                  <ApplicationStatusPill status={a.status} />
                  <p className="text-xs text-muted-foreground">
                    Sent {formatDate(a.submittedAt)}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Briefcase className="h-7 w-7" />}
          title="No applications yet"
          description="When you apply to a role, it'll show up here."
          action={
            <Button asChild>
              <Link to="/opportunities">Find opportunities</Link>
            </Button>
          }
        />
      )}
    </AppShell>
  );
}
