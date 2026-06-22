import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { OnboardingLayout } from "@/components/layout/OnboardingLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TagInput } from "@/components/forms/TagInput";
import { FileDropzone } from "@/components/forms/FileDropzone";
import { useOnboardingStore, useAuthStore } from "@/store";
import { SA_UNIVERSITIES, SA_CITIES, SKILLS_CATALOG } from "@/constants";

export const Route = createFileRoute("/onboarding/graduate")({
  head: () => ({
    meta: [
      { title: "Set up your graduate profile — Ikusasa" },
      { name: "description", content: "Build the profile that lands your next role." },
    ],
  }),
  component: GraduateOnboarding,
});

const STEPS = ["About you", "Skills", "Portfolio", "CV", "Review"];

function GraduateOnboarding() {
  const navigate = useNavigate();
  const { step, next, back, graduate, setGraduate, reset } = useOnboardingStore();
  const updateUser = useAuthStore((s) => s.updateUser);
  const [submitting, setSubmitting] = useState(false);

  const canNext = (() => {
    switch (step) {
      case 1:
        return Boolean(
          graduate.fullName &&
            graduate.university &&
            graduate.degree &&
            graduate.graduationYear &&
            graduate.yearsSinceGraduation !== undefined
        );
      case 2:
        return (graduate.skills?.length ?? 0) >= 1;
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
    navigate({ to: "/graduate/dashboard" });
  }

  return (
    <OnboardingLayout
      title={
        step === 1
          ? "Tell us about you"
          : step === 2
            ? "What can you do?"
            : step === 3
              ? "Share your portfolio"
              : step === 4
                ? "Upload your CV"
                : "Review and finish"
      }
      subtitle={
        step === 5 ? "Looks good? You can edit any of this later." : "A complete profile gets ~3× more invites."
      }
      steps={STEPS}
      current={step}
      onBack={back}
      onNext={handleNext}
      nextDisabled={!canNext}
      isLastStep={step === STEPS.length}
      isSubmitting={submitting}
      nextLabel={step === STEPS.length ? "Finish & enter Ikusasa" : "Continue"}
    >
      {step === 1 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              value={graduate.fullName ?? ""}
              onChange={(e) => setGraduate({ fullName: e.target.value })}
              placeholder="Nomsa Khumalo"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="university">University</Label>
            <select
              id="university"
              value={graduate.university ?? ""}
              onChange={(e) => setGraduate({ university: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Select…</option>
              {SA_UNIVERSITIES.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="degree">Degree</Label>
            <Input
              id="degree"
              value={graduate.degree ?? ""}
              onChange={(e) => setGraduate({ degree: e.target.value })}
              placeholder="BEng Industrial"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="grad">Graduation year</Label>
            <Input
              id="grad"
              type="number"
              min={2015}
              max={2025}
              value={graduate.graduationYear ?? ""}
              onChange={(e) => setGraduate({ graduationYear: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="years">Years since graduating</Label>
            <Input
              id="years"
              type="number"
              min={0}
              max={10}
              value={graduate.yearsSinceGraduation ?? ""}
              onChange={(e) => setGraduate({ yearsSinceGraduation: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="current">Current role (optional)</Label>
            <Input
              id="current"
              value={graduate.currentRole ?? ""}
              onChange={(e) => setGraduate({ currentRole: e.target.value })}
              placeholder="Junior Data Analyst"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="city">City</Label>
            <select
              id="city"
              value={graduate.city ?? ""}
              onChange={(e) => setGraduate({ city: e.target.value })}
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
        </div>
      )}

      {step === 2 && (
        <div className="space-y-2">
          <Label>Skills</Label>
          <TagInput
            value={graduate.skills ?? []}
            onChange={(skills) => setGraduate({ skills })}
            suggestions={SKILLS_CATALOG}
          />
        </div>
      )}

      {step === 3 && (
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input
              id="linkedin"
              value={graduate.linkedin ?? ""}
              onChange={(e) => setGraduate({ linkedin: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="github">GitHub</Label>
            <Input
              id="github"
              value={graduate.github ?? ""}
              onChange={(e) => setGraduate({ github: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={graduate.website ?? ""}
              onChange={(e) => setGraduate({ website: e.target.value })}
            />
          </div>
        </div>
      )}

      {step === 4 && (
        <FileDropzone
          value={graduate.cvFileName}
          onChange={(name) => setGraduate({ cvFileName: name as string })}
          hint="PDF or DOC up to 5MB"
        />
      )}

      {step === 5 && (
        <dl className="divide-y divide-border rounded-2xl border border-border bg-canvas">
          {(
            [
              ["Name", graduate.fullName],
              ["University", graduate.university],
              ["Degree", graduate.degree],
              ["Graduation year", graduate.graduationYear?.toString()],
              ["Years since", graduate.yearsSinceGraduation?.toString()],
              ["Current role", graduate.currentRole],
              ["City", graduate.city],
              ["Skills", graduate.skills?.join(", ")],
              ["LinkedIn", graduate.linkedin],
              ["GitHub", graduate.github],
              ["Website", graduate.website],
              ["CV", graduate.cvFileName],
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
