import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { messageService } from "@/services";
import { useAuthStore } from "@/store";
import { initials, formatRelativeDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/messages/$conversationId")({
  head: () => ({ meta: [{ title: "Conversation — Ikusasa" }] }),
  component: ConversationPage,
});

function ConversationPage() {
  const { conversationId } = Route.useParams();
  const user = useAuthStore((s) => s.user);
  const userId = user?.id ?? "stu_1";
  const qc = useQueryClient();
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const { data: convo } = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: () => messageService.getConversation(conversationId),
  });
  const { data: messages, isLoading } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => messageService.listMessages(conversationId),
  });

  useEffect(() => {
    messageService.markConversationRead(conversationId).then(() => {
      qc.invalidateQueries({ queryKey: ["conversations"] });
    });
  }, [conversationId, qc]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length]);

  const send = useMutation({
    mutationFn: (body: string) =>
      messageService.sendMessage({
        conversationId,
        senderId: userId,
        senderName: user?.fullName ?? "You",
        body,
      }),
    onSuccess: () => {
      setDraft("");
      qc.invalidateQueries({ queryKey: ["messages", conversationId] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  const otherName =
    convo?.participantNames.find((n) => n !== user?.fullName) ?? convo?.participantNames[0] ?? "Conversation";

  return (
    <AppShell
      title={otherName}
      description={convo?.opportunityTitle ? `re: ${convo.opportunityTitle}` : undefined}
      actions={
        <Button asChild variant="outline" size="sm">
          <Link to="/messages">
            <ArrowLeft className="mr-1 h-4 w-4" /> All
          </Link>
        </Button>
      }
    >
      <div className="flex h-[calc(100dvh-220px)] flex-col rounded-2xl border border-border bg-card shadow-[var(--shadow-elegant)]">
        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-2/3 rounded-2xl" />
              ))}
            </div>
          ) : (
            messages?.map((m) => {
              const mine = m.senderId === userId;
              return (
                <div key={m.id} className={cn("flex items-end gap-2", mine && "flex-row-reverse")}>
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarFallback className="bg-muted text-[10px] font-semibold">
                      {initials(m.senderName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className={cn("max-w-[78%] rounded-2xl px-4 py-2 text-sm shadow-sm", mine ? "bg-primary text-primary-foreground" : "bg-muted text-foreground")}
                  >
                    <p>{m.body}</p>
                    <p className={cn("mt-1 text-[10px]", mine ? "text-primary-foreground/80" : "text-muted-foreground")}>
                      {formatRelativeDate(m.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={endRef} />
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (draft.trim()) send.mutate(draft.trim());
          }}
          className="flex items-end gap-2 border-t border-border p-3 sm:p-4"
        >
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Write a message…"
            rows={1}
            className="min-h-[44px] resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (draft.trim()) send.mutate(draft.trim());
              }
            }}
          />
          <Button type="submit" disabled={!draft.trim() || send.isPending}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </AppShell>
  );
}
