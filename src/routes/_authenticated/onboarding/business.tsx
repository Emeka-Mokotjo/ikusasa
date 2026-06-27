import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { OnboardingLayout } from "@/components/layout/OnboardingLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileDropzone } from "@/components/forms/FileDropzone";
import { useOnboardingStore, useAuthStore } from "@/store";
import { INDUSTRIES, SA_CITIES } from "@/constants";

export const Route = createFileRoute("/_authenticated/onboarding/business")({
  head: () => ({
    meta: [
      { title: "Set up your business — Ikusasa" },
      { name: "description", content: "Get verified and start hiring emerging talent." },
    ],
  }),
  component: BusinessOnboarding,
});

const STEPS = ["Company", "About", "Verification", "Review"];

function BusinessOnboarding() {
  const navigate = useNavigate();
  const { step, next, back, business, setBusiness, reset } = useOnboardingStore();
  const updateUser = useAuthStore((s) => s.updateUser);
  const [submitting, setSubmitting] = useState(false);

  const canNext = (() => {
    switch (step) {
      case 1:
        return Boolean(business.companyName && business.industry);
      case 2:
        return (business.description?.length ?? 0) >= 40;
      case 3:
        return Boolean(business.registrationNumber);
      default:
        return true;
    }
  })();

  async function handleNext() {
    if (step < STEPS.length) {
      next();
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));
    updateUser({ onboardingComplete: true });
    reset();
    navigate({ to: "/business/dashboard" });
  }

  return (
    <OnboardingLayout
      title={
        step === 1
          ? "Tell us about your company"
          : step === 2
            ? "Describe what you do"
            : step === 3
              ? "Verify your business"
              : "Review and submit"
      }
      subtitle={
        step === 4
          ? "Verification typically takes under 24 hours. You can post drafts in the meantime."
          : "Verified businesses appear higher in talent searches."
      }
      steps={STEPS}
      current={step}
      onBack={back}
      onNext={handleNext}
      nextDisabled={!canNext}
      isLastStep={step === STEPS.length}
      isSubmitting={submitting}
      nextLabel={step === STEPS.length ? "Submit for verification" : "Continue"}
    >
      {step === 1 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="companyName">Company name</Label>
            <Input
              id="companyName"
              value={business.companyName ?? ""}
              onChange={(e) => setBusiness({ companyName: e.target.value })}
              placeholder="Kwelo Ventures"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <select
              id="industry"
              value={business.industry ?? ""}
              onChange={(e) => setBusiness({ industry: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Select…</option>
              {INDUSTRIES.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Headquartered in</Label>
            <select
              id="city"
              value={business.city ?? ""}
              onChange={(e) => setBusiness({ city: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Select…</option>
              {SA_CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="website">Website (optional)</Label>
            <Input
              id="website"
              value={business.website ?? ""}
              onChange={(e) => setBusiness({ website: e.target.value })}
              placeholder="https://kwelo.co.za"
            />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-2">
          <Label htmlFor="description">Company description</Label>
          <Textarea
            id="description"
            rows={6}
            value={business.description ?? ""}
            onChange={(e) => setBusiness({ description: e.target.value })}
            placeholder="What you do, who you serve, what makes you a great place to do early-career work."
          />
          <p className="text-xs text-muted-foreground">
            {business.description?.length ?? 0} / 40 characters minimum
          </p>
        </div>
      )}

      {step === 3 && (
        <div className="grid gap-6">
          <div className="space-y-2">
            <Label htmlFor="reg">Company registration number</Label>
            <Input
              id="reg"
              value={business.registrationNumber ?? ""}
              onChange={(e) => setBusiness({ registrationNumber: e.target.value })}
              placeholder="2021/123456/07"
            />
          </div>
          <div className="space-y-2">
            <Label>Supporting documents</Label>
            <p className="text-xs text-muted-foreground">
              CIPC registration certificate, B-BBEE certificate, or similar.
            </p>
            <FileDropzone
              multiple
              value={business.documents ?? []}
              onChange={(names) => setBusiness({ documents: names as string[] })}
              hint="Upload one or more files — PDF, PNG, JPG"
              accept=".pdf,.png,.jpg,.jpeg"
            />
          </div>
        </div>
      )}

      {step === 4 && (
        <dl className="divide-y divide-border rounded-2xl border border-border bg-canvas">
          {(
            [
              ["Company", business.companyName],
              ["Industry", business.industry],
              ["City", business.city],
              ["Website", business.website],
              ["Description", business.description],
              ["Reg. number", business.registrationNumber],
              ["Documents", business.documents?.join(", ")],
            ] satisfies Array<[string, string | undefined]>
          ).map(([label, value]) => (
            <div key={label} className="grid grid-cols-[140px_1fr] gap-4 px-4 py-3 sm:px-5">
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {label}
              </dt>
              <dd className="text-sm text-foreground">{value || "—"}</dd>
            </div>
          ))}
        </dl>
      )}
    </OnboardingLayout>
  );
}
