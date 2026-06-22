import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/business/dashboard")({
  head: () => ({ meta: [{ title: "Business dashboard — Ikusasa" }] }),
  component: BusinessDashboard,
});

function BusinessDashboard() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  return (
    <div className="min-h-screen bg-canvas">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Logo />
        <div className="flex items-center gap-2">
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {user?.fullName ?? "Guest"} · Business
          </span>
          <Button
            variant="ghost"
            onClick={async () => {
              await logout();
              window.location.href = "/";
            }}
          >
            Log out
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-16 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" /> Submitted for verification
        </span>
        <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Welcome to Ikusasa for Business.
        </h1>
        <p className="mt-3 text-muted-foreground">
          We'll verify your business within 24 hours. Posting opportunities, applicant management,
          and analytics ship in the next phase.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild>
            <Link to="/">Back to home</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
