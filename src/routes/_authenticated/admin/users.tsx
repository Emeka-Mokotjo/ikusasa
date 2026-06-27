import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
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
import { ROLE_LABEL } from "@/constants";
import { formatDate, initials } from "@/lib/format";
import type { UserRole } from "@/types";

export const Route = createFileRoute("/_authenticated/admin/users")({
  head: () => ({ meta: [{ title: "Users — Admin · Ikusasa" }] }),
  component: AdminUsersPage,
});

const ROLE_FILTERS: Array<UserRole | "all"> = ["all", "student", "graduate", "business"];

function AdminUsersPage() {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<UserRole | "all">("all");
  const { data, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => adminService.allUsers(),
  });

  const rows = (data ?? [])
    .filter((u) => (role === "all" ? true : u.role === role))
    .filter((u) =>
      query.trim()
        ? `${u.fullName} ${u.email} ${u.city ?? ""}`.toLowerCase().includes(query.toLowerCase())
        : true
    );

  return (
    <AppShell title="Users" description="Everyone on the Ikusasa platform.">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, city"
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1">
          {ROLE_FILTERS.map((r) => (
            <Button
              key={r}
              size="sm"
              variant={role === r ? "default" : "ghost"}
              onClick={() => setRole(r)}
              className="capitalize"
            >
              {r === "all" ? "All" : ROLE_LABEL[r]}
            </Button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-[var(--shadow-elegant)]">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No users match" description="Try a different role or search." />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {initials(u.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{u.fullName}</p>
                        <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="rounded-full">
                      {ROLE_LABEL[u.role]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{u.city ?? "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(u.createdAt)}
                  </TableCell>
                  <TableCell>
                    {u.role === "business" ? (
                      u.verified ? (
                        <Badge className="rounded-full bg-success/15 text-success hover:bg-success/15">
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="rounded-full">
                          Pending
                        </Badge>
                      )
                    ) : (
                      <Badge className="rounded-full bg-success/15 text-success hover:bg-success/15">
                        Active
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
