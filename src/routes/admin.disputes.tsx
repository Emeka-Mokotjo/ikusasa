import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { CheckCircle2, Flag, XCircle } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "@/components/common/EmptyState";
import { adminService } from "@/services";
import { formatRelativeDate, formatZAR } from "@/lib/format";
import { ROLE_LABEL } from "@/constants";
import { cn } from "@/lib/utils";
import type { DisputeStatus } from "@/types";

export const Route = createFileRoute("/admin/disputes")({
  head: () => ({ meta: [{ title: "Disputes — Admin · Ikusasa" }] }),
  component: AdminDisputesPage,
});

const STATUS_STYLES: Record<DisputeStatus, string> = {
  open: "bg-destructive/10 text-destructive",
  in_review: "bg-chart-4/15 text-chart-4",
  resolved: "bg-success/15 text-success",
  rejected: "bg-muted text-muted-foreground",
};

const STATUS_LABEL: Record<DisputeStatus, string> = {
  open: "Open",
  in_review: "In review",
  resolved: "Resolved",
  rejected: "Rejected",
};

const TABS: { value: DisputeStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "in_review", label: "In review" },
  { value: "resolved", label: "Resolved" },
  { value: "rejected", label: "Rejected" },
];

function AdminDisputesPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<DisputeStatus | "all">("all");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-disputes"],
    queryFn: () => adminService.disputes(),
  });

  const update = useMutation({
    mutationFn: ({ id, status }: { id: string; status: DisputeStatus }) =>
      adminService.updateDispute(id, status),
    onSuccess: (_d, vars) => {
      toast.success(`Dispute marked ${STATUS_LABEL[vars.status].toLowerCase()}`);
      qc.invalidateQueries({ queryKey: ["admin-disputes"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });

  const rows = (data ?? []).filter((d) => (tab === "all" ? true : d.status === tab));

  return (
    <AppShell
      title="Disputes"
      description="Resolve conflicts between freelancers and businesses."
    >
      <Tabs value={tab} onValueChange={(v) => setTab(v as DisputeStatus | "all")}>
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
                <Skeleton key={i} className="h-24 w-full rounded-2xl" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <EmptyState
              title="No disputes in this view"
              description="Reports raised by users will appear here."
            />
          ) : (
            <ul className="space-y-3">
              {rows.map((d) => (
                <li
                  key={d.id}
                  className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-elegant)]"
                >
                  <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Flag className="h-4 w-4 text-primary" />
                        <h3 className="font-display text-base font-semibold text-foreground">
                          {d.opportunityTitle}
                        </h3>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                            STATUS_STYLES[d.status]
                          )}
                        >
                          {STATUS_LABEL[d.status]}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{d.reason}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="secondary" className="rounded-full text-xs">
                          {d.raisedByName} · {ROLE_LABEL[d.raisedByRole]}
                        </Badge>
                        <span>vs.</span>
                        <Badge variant="outline" className="rounded-full text-xs">
                          {d.againstName}
                        </Badge>
                        <span>· {formatRelativeDate(d.createdAt)}</span>
                        {typeof d.amount === "number" && (
                          <span>· {formatZAR(d.amount)} in dispute</span>
                        )}
                      </div>
                    </div>
                    {(d.status === "open" || d.status === "in_review") && (
                      <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-stretch">
                        {d.status === "open" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => update.mutate({ id: d.id, status: "in_review" })}
                            disabled={update.isPending}
                          >
                            Start review
                          </Button>
                        )}
                        <Button
                          size="sm"
                          className="shadow-[var(--shadow-coral)]"
                          onClick={() => update.mutate({ id: d.id, status: "resolved" })}
                          disabled={update.isPending}
                        >
                          <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Resolve
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => update.mutate({ id: d.id, status: "rejected" })}
                          disabled={update.isPending}
                        >
                          <XCircle className="mr-1 h-3.5 w-3.5" /> Reject
                        </Button>
                      </div>
                    )}
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
