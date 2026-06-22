import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { OnboardingLayout } from "@/components/layout/OnboardingLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TagInput } from "@/components/forms/TagInput";
import { FileDropzone } from "@/components/forms/FileDropzone";
import { useOnboardingStore, useAuthStore } from "@/store";
import { SA_UNIVERSITIES, SA_CITIES, SKILLS_CATALOG } from "@/constants";

export const Route = createFileRoute("/onboarding/student")({
  head: () => ({
    meta: [
      { title: "Set up your student profile — Ikusasa" },
      { name: "description", content: "Tell us about you so we can match you with the right work." },
    ],
  }),
  component: StudentOnboarding,
});

const STEPS = ["About you", "Skills", "Portfolio", "CV", "Review"];

function StudentOnboarding() {
  const navigate = useNavigate();
  const { step, next, back, student, setStudent, reset } = useOnboardingStore();
  const updateUser = useAuthStore((s) => s.updateUser);
  const [submitting, setSubmitting] = useState(false);

  const canNext = (() => {
    switch (step) {
      case 1:
        return Boolean(student.fullName && student.university && student.degree && student.graduationYear);
      case 2:
        return (student.skills?.length ?? 0) >= 1;
      case 3:
        return true;
      case 4:
        return true;
      case 5:
        return true;
      default:
        return false;
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
    navigate({ to: "/student/dashboard" });
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
        step === 5
          ? "Everything looks good? You can edit any of this from your profile later."
          : "This helps us match you to opportunities you'll actually love."
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
              value={student.fullName ?? ""}
              onChange={(e) => setStudent({ fullName: e.target.value })}
              placeholder="Amahle Ndlovu"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="university">University</Label>
            <select
              id="university"
              value={student.university ?? ""}
              onChange={(e) => setStudent({ university: e.target.value })}
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
              value={student.degree ?? ""}
              onChange={(e) => setStudent({ degree: e.target.value })}
              placeholder="BSc Computer Science"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="grad">Graduation year</Label>
            <Input
              id="grad"
              type="number"
              min={2024}
              max={2032}
              value={student.graduationYear ?? ""}
              onChange={(e) => setStudent({ graduationYear: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <select
              id="city"
              value={student.city ?? ""}
              onChange={(e) => setStudent({ city: e.target.value })}
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
          <p className="text-xs text-muted-foreground">
            Add at least one. Tap suggestions or type your own.
          </p>
          <TagInput
            value={student.skills ?? []}
            onChange={(skills) => setStudent({ skills })}
            suggestions={SKILLS_CATALOG}
            placeholder="e.g. React, Figma, Copywriting"
          />
        </div>
      )}

      {step === 3 && (
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input
              id="linkedin"
              value={student.linkedin ?? ""}
              onChange={(e) => setStudent({ linkedin: e.target.value })}
              placeholder="https://linkedin.com/in/you"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="github">GitHub</Label>
            <Input
              id="github"
              value={student.github ?? ""}
              onChange={(e) => setStudent({ github: e.target.value })}
              placeholder="https://github.com/you"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={student.website ?? ""}
              onChange={(e) => setStudent({ website: e.target.value })}
              placeholder="https://yourname.co.za"
            />
          </div>
        </div>
      )}

      {step === 4 && (
        <FileDropzone
          value={student.cvFileName}
          onChange={(name) => setStudent({ cvFileName: name as string })}
          hint="PDF or DOC up to 5MB — businesses see this when you apply"
        />
      )}

      {step === 5 && <ReviewSection data={student} />}
    </OnboardingLayout>
  );
}

function ReviewSection({ data }: { data: ReturnType<typeof useOnboardingStore.getState>["student"] }) {
  const rows: Array<[string, string | undefined]> = [
    ["Name", data.fullName],
    ["University", data.university],
    ["Degree", data.degree],
    ["Graduation year", data.graduationYear?.toString()],
    ["City", data.city],
    ["Skills", data.skills?.join(", ")],
    ["LinkedIn", data.linkedin],
    ["GitHub", data.github],
    ["Website", data.website],
    ["CV", data.cvFileName],
  ];
  return (
    <dl className="divide-y divide-border rounded-2xl border border-border bg-canvas">
      {rows.map(([label, value]) => (
        <div key={label} className="grid grid-cols-[140px_1fr] gap-4 px-4 py-3 sm:px-5">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </dt>
          <dd className="text-sm text-foreground">{value || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}
