import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { useAuthStore } from "@/store";
import { reviewService, studentService, graduateService, businessService } from "@/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/common/StarRating";
import { EmptyState } from "@/components/common/EmptyState";
import { initials, formatRelativeDate } from "@/lib/format";
import { Briefcase, ExternalLink, MapPin, Pencil, ShieldCheck, Star, User as UserIcon } from "lucide-react";
import type { Business, Graduate, Student } from "@/types";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  if (!user) {
    return (
      <AppShell title="Profile">
        <EmptyState
          icon={<UserIcon className="h-8 w-8" />}
          title="Sign in to view your profile"
          description="You need an account to manage your Ikusasa profile."
          action={<Button onClick={() => navigate({ to: "/login" })}>Sign in</Button>}
        />
      </AppShell>
    );
  }

  const reviewsQuery = useQuery({
    queryKey: ["reviews", "subject", user.id],
    queryFn: () => reviewService.bySubjectId(user.id),
  });
  const summaryQuery = useQuery({
    queryKey: ["reviews", "summary", user.id],
    queryFn: () => reviewService.summaryFor(user.id),
  });

  const reviews = reviewsQuery.data ?? [];
  const summary = summaryQuery.data ?? { count: 0, average: 0 };

  return (
    <AppShell
      title="My profile"
      description="This is how businesses and collaborators see you on Ikusasa."
      actions={
        <Button variant="outline">
          <Pencil className="mr-2 h-4 w-4" /> Edit profile
        </Button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                {initials(user.fullName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-display text-xl font-semibold">{user.fullName}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Badge variant="secondary" className="capitalize">{user.role}</Badge>
              {user.role === "business" && (user as Business).verified && (
                <Badge className="gap-1"><ShieldCheck className="h-3 w-3" /> Verified</Badge>
              )}
              {"city" in user && user.city && (
                <Badge variant="outline" className="gap-1"><MapPin className="h-3 w-3" />{user.city}</Badge>
              )}
            </div>
            <div className="flex items-center gap-2 pt-2">
              <StarRating value={summary.average} showValue />
              <span className="text-xs text-muted-foreground">({summary.count} reviews)</span>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <RoleDetails user={user} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Star className="h-4 w-4 text-primary" /> Reviews</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/reviews">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {reviews.length === 0 ? (
              <EmptyState
                icon={<Star className="h-8 w-8" />}
                title="No reviews yet"
                description="Once you complete projects, businesses and talent can review you here."
              />
            ) : (
              <ul className="divide-y divide-border">
                {reviews.slice(0, 4).map((r) => (
                  <li key={r.id} className="grid gap-2 py-4 sm:grid-cols-[1fr_auto]">
                    <div>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="bg-muted text-[10px]">{initials(r.authorName)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{r.authorName}</span>
                        {r.opportunityTitle && (
                          <span className="text-xs text-muted-foreground">· {r.opportunityTitle}</span>
                        )}
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
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function RoleDetails({ user }: { user: ReturnType<typeof useAuthStore.getState>["user"] }) {
  if (!user) return null;
  if (user.role === "student" || user.role === "graduate") {
    const u = user as Student | Graduate;
    return (
      <>
        <DetailRow label="University" value={u.university || "—"} />
        <DetailRow label="Degree" value={u.degree || "—"} />
        <DetailRow label="Graduation year" value={String(u.graduationYear)} />
        {u.role === "graduate" && (u as Graduate).currentRole && (
          <DetailRow label="Current role" value={(u as Graduate).currentRole!} />
        )}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {(u.skills ?? []).map((s) => (
              <Badge key={s} variant="secondary" className="font-normal">{s}</Badge>
            ))}
            {(!u.skills || u.skills.length === 0) && <span className="text-muted-foreground">No skills listed</span>}
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          {Object.entries(u.portfolio ?? {}).map(([k, v]) =>
            v ? (
              <a key={k} href={v} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs hover:bg-accent">
                <ExternalLink className="h-3 w-3" /> <span className="capitalize">{k}</span>
              </a>
            ) : null
          )}
        </div>
      </>
    );
  }
  if (user.role === "business") {
    const b = user as Business;
    return (
      <>
        <DetailRow label="Company" value={b.companyName || "—"} />
        <DetailRow label="Industry" value={b.industry || "—"} />
        {b.website && <DetailRow label="Website" value={b.website} />}
        {b.registrationNumber && <DetailRow label="Reg #" value={b.registrationNumber} />}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">About</p>
          <p className="text-foreground/90">{b.description || "No company description yet."}</p>
        </div>
      </>
    );
  }
  return <p className="text-muted-foreground">Administrator account.</p>;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3 text-sm">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="text-foreground/90">{value}</span>
    </div>
  );
}

// silence unused import warning if Briefcase isn't used yet
void Briefcase;
