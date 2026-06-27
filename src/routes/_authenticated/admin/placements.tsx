import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, CheckCircle2, Clock } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { ROLE_LABEL } from "@/constants";
import { formatDate, formatZAR, initials } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/placements")({
  head: () => ({ meta: [{ title: "Placements — Admin · Ikusasa" }] }),
  component: AdminPlacementsPage,
});

function AdminPlacementsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-placements"],
    queryFn: () => adminService.placements(),
  });

  const active = data?.filter((p) => p.status === "active").length ?? 0;
  const completed = data?.filter((p) => p.status === "completed").length ?? 0;
  const gmv = data?.reduce((sum, p) => sum + p.compensationAmount, 0) ?? 0;

  return (
    <AppShell
      title="Placements"
      description="Successful matches between talent and businesses."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Active placements"
          value={isLoading ? "—" : String(active)}
          hint="Currently working"
          icon={<Clock className="h-4 w-4" />}
        />
        <StatCard
          label="Completed"
          value={isLoading ? "—" : String(completed)}
          hint="Wrapped successfully"
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
        <StatCard
          label="GMV"
          value={isLoading ? "—" : formatZAR(gmv, { compact: true })}
          hint="Gross marketplace value"
          icon={<Briefcase className="h-4 w-4" />}
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
              title="No placements yet"
              description="Hired applicants will appear here as placements."
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Talent</TableHead>
                <TableHead>Business</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {initials(p.applicantName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{p.applicantName}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {ROLE_LABEL[p.applicantRole]}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{p.businessName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {p.opportunityTitle}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(p.startedAt)}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {formatZAR(p.compensationAmount)}
                  </TableCell>
                  <TableCell>
                    {p.status === "active" ? (
                      <Badge className="rounded-full bg-chart-4/15 text-chart-4 hover:bg-chart-4/15">
                        Active
                      </Badge>
                    ) : (
                      <Badge className="rounded-full bg-success/15 text-success hover:bg-success/15">
                        Completed
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
