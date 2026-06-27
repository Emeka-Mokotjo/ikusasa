import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, FileText, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "@/components/common/EmptyState";
import { ApplicationStatusPill } from "@/components/common/StatusPill";
import { applicationService, opportunityService } from "@/services";
import { formatRelativeDate, initials } from "@/lib/format";
import { ROLE_LABEL } from "@/constants";
import type { ApplicationStatus } from "@/types";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/business/opportunities/$opportunityId/applicants")({
  head: () => ({ meta: [{ title: "Applicants — Ikusasa" }] }),
  component: ApplicantManagementPage,
});

const TABS: { value: ApplicationStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "submitted", label: "New" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "interview", label: "Interview" },
  { value: "accepted", label: "Hired" },
  { value: "rejected", label: "Rejected" },
];

function ApplicantManagementPage() {
  const { opportunityId } = Route.useParams();
  const qc = useQueryClient();
  const [tab, setTab] = useState<ApplicationStatus | "all">("all");

  const { data: opp } = useQuery({
    queryKey: ["opp", opportunityId],
    queryFn: () => opportunityService.byId(opportunityId),
  });
  const { data: apps, isLoading } = useQuery({
    queryKey: ["opp-apps", opportunityId],
    queryFn: () => applicationService.byOpportunityId(opportunityId),
  });

  const update = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ApplicationStatus }) =>
      applicationService.updateStatus(id, status),
    onSuccess: (_d, vars) => {
      toast.success(`Marked as ${vars.status}`);
      qc.invalidateQueries({ queryKey: ["opp-apps", opportunityId] });
    },
  });

  const filtered = (apps ?? []).filter((a) => (tab === "all" ? true : a.status === tab));

  return (
    <AppShell
      title={opp ? opp.title : "Applicants"}
      description={opp ? `${opp.businessName} · ${apps?.length ?? 0} applicants` : "Review and manage applicants for this role."}
      actions={
        <Button asChild variant="outline">
          <Link to="/business/opportunities">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> All roles
          </Link>
        </Button>
      }
    >
      <Tabs value={tab} onValueChange={(v) => setTab(v as ApplicationStatus | "all")}>
        <TabsList className="mb-4 flex w-full flex-wrap justify-start gap-1 bg-muted/60 p-1">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="rounded-lg">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={tab} className="mt-0">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full rounded-2xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No applicants in this view"
              description="Try a different filter or wait for more candidates."
            />
          ) : (
            <ul className="space-y-3">
              {filtered.map((a) => (
                <li
                  key={a.id}
                  className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-elegant)]"
                >
                  <div className="grid gap-4 sm:grid-cols-[auto_1fr_auto] sm:items-start">
                    <Avatar className="h-11 w-11">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {initials(a.applicantName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          to="/profile/$userId"
                          params={{ userId: a.applicantId }}
                          className="font-display text-base font-semibold text-foreground hover:text-primary"
                        >
                          {a.applicantName}
                        </Link>
                        <Badge variant="secondary" className="rounded-full text-xs">
                          {ROLE_LABEL[a.applicantRole]}
                        </Badge>
                        <ApplicationStatusPill status={a.status} />
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        {a.coverMessage}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span>Applied {formatRelativeDate(a.submittedAt)}</span>
                        {a.cvFileName && (
                          <span className="inline-flex items-center gap-1">
                            <FileText className="h-3 w-3" /> {a.cvFileName}
                          </span>
                        )}
                        {a.portfolioLink && (
                          <a
                            href={a.portfolioLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:underline"
                          >
                            Portfolio <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-stretch">
                      <Button size="sm" variant="outline" asChild>
                        <Link to="/messages">
                          <MessageSquare className="mr-1 h-3.5 w-3.5" /> Message
                        </Link>
                      </Button>
                      {a.status !== "shortlisted" && a.status !== "accepted" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => update.mutate({ id: a.id, status: "shortlisted" })}
                          disabled={update.isPending}
                        >
                          Shortlist
                        </Button>
                      )}
                      {a.status !== "interview" && a.status !== "accepted" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => update.mutate({ id: a.id, status: "interview" })}
                          disabled={update.isPending}
                        >
                          Interview
                        </Button>
                      )}
                      {a.status !== "accepted" && (
                        <Button
                          size="sm"
                          className="shadow-[var(--shadow-coral)]"
                          onClick={() => update.mutate({ id: a.id, status: "accepted" })}
                          disabled={update.isPending}
                        >
                          Hire
                        </Button>
                      )}
                      {a.status !== "rejected" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => update.mutate({ id: a.id, status: "rejected" })}
                          disabled={update.isPending}
                        >
                          Reject
                        </Button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
