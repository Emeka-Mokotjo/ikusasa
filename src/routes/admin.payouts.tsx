import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownRight, ArrowUpRight, Wallet } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatCard } from "@/components/dashboard/StatCard";
import { EmptyState } from "@/components/common/EmptyState";
import { adminService } from "@/services";
import { formatDate, formatZAR } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/payouts")({
  head: () => ({ meta: [{ title: "Payouts — Admin · Ikusasa" }] }),
  component: AdminPayoutsPage,
});

function AdminPayoutsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-payouts"],
    queryFn: () => adminService.payouts(),
  });

  const completed = data?.filter((t) => t.status === "completed") ?? [];
  const pending = data?.filter((t) => t.status === "pending") ?? [];
  const totalOut = completed.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const pendingAmount = pending.reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return (
    <AppShell
      title="Payouts"
      description="Money moving through the Ikusasa marketplace."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total disbursed"
          value={isLoading ? "—" : formatZAR(totalOut, { compact: true })}
          hint={`${completed.length} completed transactions`}
          icon={<ArrowUpRight className="h-4 w-4" />}
        />
        <StatCard
          label="Pending"
          value={isLoading ? "—" : formatZAR(pendingAmount, { compact: true })}
          hint={`${pending.length} awaiting release`}
          icon={<ArrowDownRight className="h-4 w-4" />}
        />
        <StatCard
          label="Transactions"
          value={isLoading ? "—" : String(data?.length ?? 0)}
          hint="All-time payouts & charges"
          icon={<Wallet className="h-4 w-4" />}
        />
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card shadow-[var(--shadow-elegant)]">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        ) : !data || data.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No payouts yet"
              description="Payouts and charges will appear here as they happen."
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Counterparty</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <p className="text-sm font-medium">{t.description}</p>
                    {t.opportunityTitle && (
                      <p className="text-xs text-muted-foreground">{t.opportunityTitle}</p>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {t.counterpartyName ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="rounded-full capitalize">
                      {t.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(t.createdAt)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right text-sm font-semibold",
                      t.amount < 0 ? "text-foreground" : "text-success"
                    )}
                  >
                    {formatZAR(Math.abs(t.amount))}
                  </TableCell>
                  <TableCell>
                    {t.status === "completed" ? (
                      <Badge className="rounded-full bg-success/15 text-success hover:bg-success/15">
                        Completed
                      </Badge>
                    ) : t.status === "pending" ? (
                      <Badge className="rounded-full bg-chart-4/15 text-chart-4 hover:bg-chart-4/15">
                        Pending
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="rounded-full capitalize">
                        {t.status}
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </AppShell>
  );
}
