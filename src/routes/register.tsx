import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store";
import { cn } from "@/lib/utils";
import { GraduationCap, UserCheck, Building2 } from "lucide-react";
import type { UserRole } from "@/types";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create your account — Ikusasa" },
      { name: "description", content: "Join Ikusasa as a student, graduate, or business." },
    ],
  }),
  component: RegisterPage,
});

const schema = z.object({
  fullName: z.string().min(2, "Tell us your full name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
});
type Values = z.infer<typeof schema>;

const ROLES: Array<{
  id: Exclude<UserRole, "admin">;
  label: string;
  blurb: string;
  icon: typeof GraduationCap;
}> = [
  {
    id: "student",
    label: "I'm a student",
    blurb: "Currently studying — looking for part-time and project work",
    icon: GraduationCap,
  },
  {
    id: "graduate",
    label: "I'm a graduate",
    blurb: "Recently finished — looking to land my first real roles",
    icon: UserCheck,
  },
  {
    id: "business",
    label: "I'm a business",
    blurb: "Hiring emerging talent for projects, internships, or roles",
    icon: Building2,
  },
];

function RegisterPage() {
  const navigate = useNavigate();
  const registerUser = useAuthStore((s) => s.register);
  const [role, setRole] = useState<Exclude<UserRole, "admin">>("student");
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  async function onSubmit(values: Values) {
    setError(null);
    try {
      await registerUser({ ...values, role });
      navigate({
        to:
          role === "student"
            ? "/onboarding/student"
            : role === "graduate"
              ? "/onboarding/graduate"
              : "/onboarding/business",
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create account");
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Tell us who you are so we can tailor your experience."
      footer={
        <p>
          Already on Ikusasa?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </p>
      }
    >
      <div className="space-y-6">
        <fieldset className="space-y-2">
          <legend className="mb-2 text-sm font-medium text-foreground">I'm joining as</legend>
          <div role="radiogroup" className="grid gap-2">
            {ROLES.map((r) => {
              const Icon = r.icon;
              const active = role === r.id;
              return (
                <button
                  type="button"
                  role="radio"
                  aria-checked={active}
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  className={cn(
                    "flex items-start gap-3 rounded-2xl border bg-card p-4 text-left transition",
                    active
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-border hover:border-primary/40"
                  )}
                >
                  <span
                    className={cn(
                      "grid h-9 w-9 shrink-0 place-items-center rounded-xl",
                      active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-foreground">{r.label}</span>
                    <span className="block text-xs text-muted-foreground">{r.blurb}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-2">
            <Label htmlFor="fullName">
              {role === "business" ? "Your name (point of contact)" : "Full name"}
            </Label>
            <Input id="fullName" placeholder="Amahle Ndlovu" {...register("fullName")} />
            {errors.fullName && (
              <p className="text-xs text-destructive">{errors.fullName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.co.za"
              {...register("email")}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 6 characters"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>
          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Creating account…" : "Continue"}
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}
