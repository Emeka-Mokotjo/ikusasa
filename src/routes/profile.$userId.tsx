import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { studentService, graduateService, businessService, reviewService } from "@/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StarRating } from "@/components/common/StarRating";
import { EmptyState } from "@/components/common/EmptyState";
import { initials, formatRelativeDate } from "@/lib/format";
import { ArrowLeft, ExternalLink, MapPin, ShieldCheck, Star, UserX } from "lucide-react";
import type { Business, Graduate, Student } from "@/types";

export const Route = createFileRoute("/profile/$userId")({
  component: PublicProfilePage,
});

function PublicProfilePage() {
  const { userId } = Route.useParams();

  const profileQuery = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const [s, g, b] = await Promise.all([
        studentService.byId(userId),
        graduateService.byId(userId),
        businessService.byId(userId),
      ]);
      return s ?? g ?? b ?? null;
    },
  });

  const reviewsQuery = useQuery({
    queryKey: ["reviews", "subject", userId],
    queryFn: () => reviewService.bySubjectId(userId),
  });
  const summaryQuery = useQuery({
    queryKey: ["reviews", "summary", userId],
    queryFn: () => reviewService.summaryFor(userId),
  });

  if (profileQuery.isLoading) {
    return (
      <AppShell title="Profile">
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-64 lg:col-span-1" />
          <Skeleton className="h-64 lg:col-span-2" />
        </div>
      </AppShell>
    );
  }

  const profile = profileQuery.data;
  if (!profile) {
    return (
      <AppShell title="Profile">
        <EmptyState
          icon={<UserX className="h-8 w-8" />}
          title="Profile not found"
          description="This account doesn't exist or was removed."
          action={<Button asChild variant="outline"><Link to="/opportunities"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Link></Button>}
        />
      </AppShell>
    );
  }

  const reviews = reviewsQuery.data ?? [];
  const summary = summaryQuery.data ?? { count: 0, average: 0 };
  const displayName = profile.role === "business" ? (profile as Business).companyName || profile.fullName : profile.fullName;

  return (
    <AppShell title={displayName} description={`${profile.role[0].toUpperCase()}${profile.role.slice(1)} on Ikusasa`}>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                {initials(displayName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-display text-xl font-semibold">{displayName}</h2>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Badge variant="secondary" className="capitalize">{profile.role}</Badge>
              {profile.role === "business" && (profile as Business).verified && (
                <Badge className="gap-1"><ShieldCheck className="h-3 w-3" /> Verified</Badge>
              )}
              {"city" in profile && (profile as Student).city && (
                <Badge variant="outline" className="gap-1"><MapPin className="h-3 w-3" />{(profile as Student).city}</Badge>
              )}
            </div>
            <div className="flex items-center gap-2 pt-2">
              <StarRating value={summary.average} showValue />
              <span className="text-xs text-muted-foreground">({summary.count})</span>
            </div>
            <Button className="mt-2 w-full" asChild>
              <Link to="/messages">Message</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>About</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm">
            {profile.role === "business" ? (
              <BusinessDetails b={profile as Business} />
            ) : (
              <TalentDetails u={profile as Student | Graduate} />
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Star className="h-4 w-4 text-primary" /> Reviews ({summary.count})</CardTitle>
          </CardHeader>
          <CardContent>
            {reviews.length === 0 ? (
              <EmptyState icon={<Star className="h-8 w-8" />} title="No reviews yet" />
            ) : (
              <ul className="divide-y divide-border">
                {reviews.map((r) => (
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
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function TalentDetails({ u }: { u: Student | Graduate }) {
  return (
    <>
      <Row label="University" value={u.university || "—"} />
      <Row label="Degree" value={u.degree || "—"} />
      <Row label="Graduation" value={String(u.graduationYear)} />
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Skills</p>
        <div className="flex flex-wrap gap-1.5">
          {u.skills.map((s) => <Badge key={s} variant="secondary" className="font-normal">{s}</Badge>)}
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {Object.entries(u.portfolio ?? {}).map(([k, v]) =>
          v ? <a key={k} href={v} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs hover:bg-accent"><ExternalLink className="h-3 w-3" /> <span className="capitalize">{k}</span></a> : null
        )}
      </div>
    </>
  );
}

function BusinessDetails({ b }: { b: Business }) {
  return (
    <>
      <Row label="Industry" value={b.industry} />
      {b.website && <Row label="Website" value={b.website} />}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">About</p>
        <p className="text-foreground/90">{b.description}</p>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3 text-sm">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="text-foreground/90">{value}</span>
    </div>
  );
}
