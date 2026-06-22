import type { ReactNode } from "react";
import { Logo } from "@/components/common/Logo";
import { Stepper } from "@/components/common/Stepper";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

export function OnboardingLayout({
  title,
  subtitle,
  steps,
  current,
  onBack,
  onNext,
  nextLabel = "Continue",
  nextDisabled,
  isLastStep,
  isSubmitting,
  children,
}: {
  title: string;
  subtitle?: string;
  steps: string[];
  current: number;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  isLastStep?: boolean;
  isSubmitting?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-border bg-background/60 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Logo />
          <span className="text-xs text-muted-foreground">
            Step {current} of {steps.length}
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-10">
        <Stepper steps={steps} current={current} className="mb-10" />

        <div className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-elegant)] sm:p-10">
          <div className="mb-8">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {title}
            </h1>
            {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
          </div>

          <div className="space-y-6">{children}</div>

          <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={onBack}
              disabled={!onBack || current === 1}
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back
            </Button>
            <Button type="button" onClick={onNext} disabled={nextDisabled || isSubmitting}>
              {isLastStep ? (
                <>
                  <Check className="mr-1.5 h-4 w-4" />
                  {isSubmitting ? "Finishing…" : nextLabel}
                </>
              ) : (
                <>
                  {nextLabel}
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
