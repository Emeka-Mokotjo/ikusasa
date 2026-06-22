import type { ReactNode } from "react";
import { Logo } from "@/components/common/Logo";
import { Link } from "@tanstack/react-router";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_minmax(420px,520px)]">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden bg-foreground text-background lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Logo className="text-background [&_span:last-child]:text-background" />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 bottom-0 h-96 w-96 rounded-full bg-primary/20 blur-3xl"
        />
        <div className="relative max-w-md space-y-6">
          <p className="font-display text-3xl font-semibold leading-tight">
            Where South Africa's emerging talent gets to work.
          </p>
          <p className="text-sm text-background/70">
            Ikusasa connects students and recent graduates with businesses hiring for freelance,
            internship, and entry-level work — so you can build experience that actually counts.
          </p>
          <div className="grid grid-cols-3 gap-4 pt-4 text-sm">
            <div>
              <p className="font-display text-2xl font-semibold">12k+</p>
              <p className="text-background/60">Active talents</p>
            </div>
            <div>
              <p className="font-display text-2xl font-semibold">800+</p>
              <p className="text-background/60">Businesses</p>
            </div>
            <div>
              <p className="font-display text-2xl font-semibold">R 2.4m</p>
              <p className="text-background/60">Paid out</p>
            </div>
          </div>
        </div>
        <p className="relative text-xs text-background/50">© {new Date().getFullYear()} Ikusasa</p>
      </aside>

      {/* Form panel */}
      <main className="flex min-h-screen flex-col bg-canvas">
        <header className="flex items-center justify-between p-6 lg:hidden">
          <Logo />
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            Back home
          </Link>
        </header>
        <div className="flex flex-1 items-center justify-center px-6 pb-12">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
                {title}
              </h1>
              {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            {children}
            {footer && <div className="mt-8 text-sm text-muted-foreground">{footer}</div>}
          </div>
        </div>
      </main>
    </div>
  );
}
