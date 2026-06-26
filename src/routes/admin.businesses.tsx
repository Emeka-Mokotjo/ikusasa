import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { CheckCircle2, Search, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/common/EmptyState";
import { adminService } from "@/services";
import { formatDate, initials } from "@/lib/format";

export const Route = createFileRoute("/admin/businesses")({
  head: () => ({ meta: [{ title: "Businesses — Admin · Ikusasa" }] }),
  component: AdminBusinessesPage,
});

function AdminBusinessesPage() {
  const qc = useQueryClient();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "verified" | "pending">("all");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-businesses"],
    queryFn: () => adminService.allBusinesses(),
  });

  const approve = useMutation({
    mutationFn: (id: string) => adminService.approveBusiness(id),
    onSuccess: () => {
      toast.success("Business verified");
      qc.invalidateQueries({ queryKey: ["admin-businesses"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      qc.invalidateQueries({ queryKey: ["admin-pending"] });
    },
  });

  const rows = (data ?? [])
    .filter((b) =>
      filter === "all" ? true : filter === "verified" ? b.verified : !b.verified
    )
    .filter((b) =>
      query.trim()
        ? `${b.companyName} ${b.industry} ${b.city ?? ""}`.toLowerCase().includes(query.toLowerCase())
        : true
    );

  return (
    <AppShell
      title="Businesses"
      description="All companies registered on the Ikusasa marketplace."
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search companies, industries, cities"
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1">
          {(["all", "verified", "pending"] as const).map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "ghost"}
              className="capitalize"
              onClick={() => setFilter(f)}
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-[var(--shadow-elegant)]">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No businesses match" description="Try clearing your filters." />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {initials(b.companyName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{b.companyName}</p>
                        <p className="truncate text-xs text-muted-foreground">{b.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{b.industry}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{b.city ?? "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(b.createdAt)}
                  </TableCell>
                  <TableCell>
                    {b.verified ? (
                      <Badge className="rounded-full bg-success/15 text-success hover:bg-success/15">
                        <ShieldCheck className="mr-1 h-3 w-3" /> Verified
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="rounded-full">
                        Pending
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {!b.verified && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => approve.mutate(b.id)}
                        disabled={approve.isPending}
                      >
                        <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Verify
                      </Button>
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
