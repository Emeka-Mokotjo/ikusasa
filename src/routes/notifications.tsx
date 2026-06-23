import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Bell, BellOff, Briefcase, MessageSquare, Sparkles, Star } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { notificationService } from "@/services";
import { useAuthStore } from "@/store";
import { formatRelativeDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { NotificationKind } from "@/types";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Ikusasa" }] }),
  component: NotificationsPage,
});

const KIND_ICON: Record<NotificationKind, React.ComponentType<{ className?: string }>> = {
  application_update: Briefcase,
  new_applicant: Sparkles,
  review_received: Star,
  opportunity_match: Sparkles,
  system: Bell,
};

function NotificationsPage() {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id ?? "stu_1";
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["notifications", userId],
    queryFn: () => notificationService.byUserId(userId),
  });
  const markRead = useMutation({
    mutationFn: (id: string) => notificationService.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const unread = (data ?? []).filter((n) => !n.read).length;

  return (
    <AppShell
      title="Notifications"
      description={unread > 0 ? `${unread} unread` : "You're all caught up."}
      actions={
        unread > 0 ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => data?.filter((n) => !n.read).forEach((n) => markRead.mutate(n.id))}
          >
            Mark all read
          </Button>
        ) : null
      }
    >
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyState icon={<BellOff className="h-7 w-7" />} title="No notifications" description="We'll let you know when something happens." />
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-elegant)]">
          {data.map((n) => {
            const Icon = KIND_ICON[n.kind];
            return (
              <li
                key={n.id}
                className={cn("flex gap-3 px-4 py-4 transition-colors", !n.read && "bg-primary/[0.04]")}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">{n.title}</p>
                    <span className="shrink-0 text-xs text-muted-foreground">{formatRelativeDate(n.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
                </div>
                {!n.read && (
                  <button
                    type="button"
                    onClick={() => markRead.mutate(n.id)}
                    className="self-start text-xs font-medium text-primary hover:underline"
                  >
                    Mark read
                  </button>
                )}
                {n.kind === "application_update" && (
                  <MessageSquare className="hidden h-4 w-4 text-muted-foreground" />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </AppShell>
  );
}
