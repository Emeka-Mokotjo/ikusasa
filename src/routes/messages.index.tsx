import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MessageSquare, Search } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { messageService } from "@/services";
import { useAuthStore } from "@/store";
import { initials, formatRelativeDate } from "@/lib/format";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/messages/")({
  head: () => ({ meta: [{ title: "Messages — Ikusasa" }] }),
  component: MessagesIndex,
});

function MessagesIndex() {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id ?? "stu_1";
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["conversations", userId],
    queryFn: () => messageService.listConversations(userId),
  });

  const filtered = (data ?? []).filter((c) => {
    if (!q) return true;
    const needle = q.toLowerCase();
    return (
      c.participantNames.some((n) => n.toLowerCase().includes(needle)) ||
      c.lastMessage.toLowerCase().includes(needle) ||
      (c.opportunityTitle?.toLowerCase().includes(needle) ?? false)
    );
  });

  return (
    <AppShell title="Messages" description="Talk to businesses and applicants in real time.">
      <div className="mb-4 max-w-md">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search conversations"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="h-7 w-7" />}
          title="No conversations yet"
          description="When you connect on an opportunity, your conversations will live here."
        />
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-elegant)]">
          {filtered.map((c) => {
            const otherName = c.participantNames.find((n) => n !== user?.fullName) ?? c.participantNames[0];
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => navigate({ to: "/messages/$conversationId", params: { conversationId: c.id } })}
                  className="flex w-full items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-muted/50"
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                      {initials(otherName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className={cn("truncate text-sm font-semibold text-foreground", c.unreadCount > 0 && "text-foreground")}>
                        {otherName}
                      </p>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatRelativeDate(c.lastMessageAt)}
                      </span>
                    </div>
                    {c.opportunityTitle && (
                      <p className="truncate text-xs text-muted-foreground">re: {c.opportunityTitle}</p>
                    )}
                    <p className={cn("mt-1 line-clamp-1 text-sm", c.unreadCount > 0 ? "text-foreground" : "text-muted-foreground")}>
                      {c.lastMessage}
                    </p>
                  </div>
                  {c.unreadCount > 0 && (
                    <span className="ml-2 mt-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                      {c.unreadCount}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-6 text-xs text-muted-foreground">
        Need help getting started? <Link to="/opportunities" className="text-primary underline">Browse opportunities</Link>.
      </p>
    </AppShell>
  );
}
