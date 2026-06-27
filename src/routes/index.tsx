import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowRight, Briefcase, GraduationCap, Sparkles } from "lucide-react";

import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { ensureAuthLoaded, useAuthStore } from "@/store/auth.store";
import { dashboardForRole } from "@/lib/role-routing";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ikusasa — Where emerging talent gets to work" },
      {
        name: "description",
        content:
          "The South African marketplace connecting students and graduates with businesses for freelance, internship, and entry-level opportunities.",
      },
      { property: "og:title", content: "Ikusasa — Where emerging talent gets to work" },
      {
        property: "og:description",
        content:
          "The South African marketplace connecting students and graduates with businesses for freelance, internship, and entry-level opportunities.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    void ensureAuthLoaded();
  }, []);

  return (
    <div className="min-h-screen bg-canvas">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Logo />
        <nav className="flex items-center gap-2">
          {user ? (
            <Button asChild>
              <Link to={dashboardForRole(user.role)}>
                Go to dashboard <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link to="/auth">Sign in</Link>
              </Button>
              <Button asChild>
                <Link to="/auth">
                  Get started <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </>
          )}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-24 pt-12 sm:pt-20">
        <section className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Now in beta across South Africa
            </span>
            <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
              Where emerging talent
              <span className="block text-primary">gets to work.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              Ikusasa is the marketplace where South African students and graduates land freelance
              gigs, internships, and entry-level work — and where businesses find the next wave of
              talent.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/auth">
                  Create your profile <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/auth">I already have an account</Link>
              </Button>
            </div>
          </div>

          <div className="relative grid gap-4">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-10 h-72 w-72 rounded-full bg-primary/15 blur-3xl"
            />
            <div className="relative rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-elegant)]">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-accent-foreground">
                  <GraduationCap className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold">For students & graduates</p>
                  <p className="text-xs text-muted-foreground">
                    Real work. Real reviews. Real income.
                  </p>
                </div>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>• Apply to vetted opportunities in minutes</li>
                <li>• Build a portfolio of completed projects</li>
                <li>• Earn in ZAR, paid on milestones</li>
              </ul>
            </div>
            <div className="relative rounded-3xl border border-border bg-foreground p-6 text-background shadow-[var(--shadow-elegant)]">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
                  <Briefcase className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold">For businesses</p>
                  <p className="text-xs text-background/60">
                    Hire emerging talent without the gatekeeping.
                  </p>
                </div>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-background/70">
                <li>• Post a role in under 3 minutes</li>
                <li>• Shortlist with rich profiles and portfolios</li>
                <li>• Verified payments and review system</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
