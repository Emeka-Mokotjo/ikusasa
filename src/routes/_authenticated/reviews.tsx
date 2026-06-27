import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { useAuthStore } from "@/store";
import { reviewService } from "@/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { StarRating } from "@/components/common/StarRating";
import { EmptyState } from "@/components/common/EmptyState";
import { initials, formatRelativeDate } from "@/lib/format";
import { Plus, Star } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/reviews")({
  component: ReviewsPage,
});

function ReviewsPage() {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();

  const receivedQ = useQuery({
    queryKey: ["reviews", "subject", user?.id],
    queryFn: () => reviewService.bySubjectId(user!.id),
    enabled: !!user,
  });
  const givenQ = useQuery({
    queryKey: ["reviews", "author", user?.id],
    queryFn: () => reviewService.byAuthorId(user!.id),
    enabled: !!user,
  });
  const summaryQ = useQuery({
    queryKey: ["reviews", "summary", user?.id],
    queryFn: () => reviewService.summaryFor(user!.id),
    enabled: !!user,
  });

  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [opportunity, setOpportunity] = useState("");

  const submit = useMutation({
    mutationFn: () =>
      reviewService.submit({
        subjectId: subjectId.trim(),
        subjectType: "business",
        authorId: user!.id,
        authorName: user!.fullName,
        rating,
        comment: comment.trim(),
        opportunityTitle: opportunity.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success("Review submitted");
      setOpen(false);
      setComment("");
      setSubjectId("");
      setOpportunity("");
      setRating(5);
      qc.invalidateQueries({ queryKey: ["reviews"] });
    },
  });

  const received = receivedQ.data ?? [];
  const given = givenQ.data ?? [];
  const summary = summaryQ.data ?? { count: 0, average: 0 };

  return (
    <AppShell
      title="Reviews"
      description="Build credibility through honest collaboration feedback."
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Leave a review</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Leave a review</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Rating</Label>
                <StarRating value={rating} onChange={setRating} size={28} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subj">Person or business ID</Label>
                <Input id="subj" value={subjectId} onChange={(e) => setSubjectId(e.target.value)} placeholder="e.g. biz_1 or stu_1" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="opp">Opportunity (optional)</Label>
                <Input id="opp" value={opportunity} onChange={(e) => setOpportunity(e.target.value)} placeholder="e.g. Frontend prototype" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="comment">Comment</Label>
                <Textarea id="comment" rows={4} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="What was the experience like?" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={() => submit.mutate()} disabled={!subjectId || !comment || submit.isPending}>
                {submit.isPending ? "Submitting…" : "Submit"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Average rating</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="font-display text-3xl font-semibold">{summary.average.toFixed(1)}</span>
              <StarRating value={summary.average} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Reviews received</p>
            <p className="mt-2 font-display text-3xl font-semibold">{received.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Reviews written</p>
            <p className="mt-2 font-display text-3xl font-semibold">{given.length}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="received">
        <TabsList>
          <TabsTrigger value="received">Received</TabsTrigger>
          <TabsTrigger value="given">Given</TabsTrigger>
        </TabsList>
        <TabsContent value="received" className="mt-4">
          <ReviewList items={received} emptyTitle="No reviews yet" />
        </TabsContent>
        <TabsContent value="given" className="mt-4">
          <ReviewList items={given} emptyTitle="You haven't reviewed anyone yet" />
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

function ReviewList({ items, emptyTitle }: { items: Array<{ id: string; authorName: string; rating: number; comment: string; createdAt: string; opportunityTitle?: string }>; emptyTitle: string }) {
  if (items.length === 0) return <EmptyState icon={<Star className="h-8 w-8" />} title={emptyTitle} />;
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">All reviews</CardTitle></CardHeader>
      <CardContent>
        <ul className="divide-y divide-border">
          {items.map((r) => (
            <li key={r.id} className="grid gap-2 py-4 sm:grid-cols-[1fr_auto]">
              <div>
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7"><AvatarFallback className="bg-muted text-[10px]">{initials(r.authorName)}</AvatarFallback></Avatar>
                  <span className="text-sm font-medium">{r.authorName}</span>
                  {r.opportunityTitle && <span className="text-xs text-muted-foreground">· {r.opportunityTitle}</span>}
                </div>
                <p className="mt-2 text-sm text-foreground/90">{r.comment}</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground sm:flex-col sm:items-end">
                <StarRating value={r.rating} size={14} />
                <span>{formatRelativeDate(r.createdAt)}</span>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
