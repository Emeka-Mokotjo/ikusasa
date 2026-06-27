import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Building2, GraduationCap, UserCheck } from "lucide-react";

import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuthStore } from "@/store/auth.store";
import { dashboardForRole, onboardingRouteForRole } from "@/lib/role-routing";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

const searchSchema = z.object({
  redirect: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in — Ikusasa" },
      {
        name: "description",
        content: "Sign in or create your Ikusasa account as a student, graduate, or business.",
      },
    ],
  }),
  component: AuthPage,
});

const signInSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
});
type SignInValues = z.infer<typeof signInSchema>;

const signUpSchema = signInSchema.extend({
  fullName: z.string().min(2, "Tell us your full name"),
});
type SignUpValues = z.infer<typeof signUpSchema>;

const ROLES: Array<{
  id: Exclude<UserRole, "admin">;
  label: string;
  blurb: string;
  icon: typeof GraduationCap;
}> = [
  {
    id: "student",
    label: "I'm a student",
    blurb: "Currently studying — looking for project work",
    icon: GraduationCap,
  },
  {
    id: "graduate",
    label: "I'm a graduate",
    blurb: "Recently finished — launching my career",
    icon: UserCheck,
  },
  {
    id: "business",
    label: "I'm a business",
    blurb: "Hiring emerging talent for projects or roles",
    icon: Building2,
  },
];

function AuthPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: Route.id });
  const user = useAuthStore((s) => s.user);
  const initializing = useAuthStore((s) => s.initializing);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [forgotOpen, setForgotOpen] = useState(false);

  useEffect(() => {
    if (!initializing && user) {
      const target = user.onboardingComplete
        ? (search.redirect ?? dashboardForRole(user.role))
        : onboardingRouteForRole(user.role);
      navigate({ to: target as string, replace: true });
    }
  }, [initializing, user, navigate, search.redirect]);

  async function handleGoogle() {
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + "/auth",
      });
      if (result.error) {
        toast.error(result.error.message ?? "Google sign-in failed");
        return;
      }
      if (result.redirected) return;
      // Session set by helper — refresh store
      await useAuthStore.getState().refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Google sign-in failed");
    }
  }

  return (
    <AuthLayout
      title="Welcome to Ikusasa"
      subtitle="Sign in to continue, or create a new account."
      footer={
        <p>
          By continuing you agree to Ikusasa's terms and privacy policy.{" "}
          <Link to="/" className="font-medium text-primary hover:underline">
            Back home
          </Link>
        </p>
      }
    >
      <div className="space-y-5">
        <Button type="button" variant="outline" className="w-full" onClick={handleGoogle}>
          Continue with Google
        </Button>

        <div className="relative text-center text-xs uppercase tracking-wider text-muted-foreground">
          <span className="bg-canvas px-3">or with email</span>
          <span className="absolute inset-x-0 top-1/2 -z-10 h-px bg-border" />
        </div>

        <Tabs value={mode} onValueChange={(v) => setMode(v as "signin" | "signup")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign in</TabsTrigger>
            <TabsTrigger value="signup">Create account</TabsTrigger>
          </TabsList>
          <TabsContent value="signin" className="mt-5">
            <SignInForm onForgot={() => setForgotOpen(true)} />
          </TabsContent>
          <TabsContent value="signup" className="mt-5">
            <SignUpForm />
          </TabsContent>
        </Tabs>
      </div>

      <ForgotDialog open={forgotOpen} onOpenChange={setForgotOpen} />
    </AuthLayout>
  );
}

function SignInForm({ onForgot }: { onForgot: () => void }) {
  const login = useAuthStore((s) => s.login);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: SignInValues) {
    setServerError(null);
    try {
      await login(values);
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Could not sign in");
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-2">
        <Label htmlFor="signin-email">Email</Label>
        <Input
          id="signin-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.co.za"
          {...register("email")}
        />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="signin-password">Password</Label>
          <button
            type="button"
            onClick={onForgot}
            className="text-xs font-medium text-primary hover:underline"
          >
            Forgot password?
          </button>
        </div>
        <Input
          id="signin-password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          {...register("password")}
        />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>
      {serverError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {serverError}
        </p>
      )}
      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}

function SignUpForm() {
  const registerUser = useAuthStore((s) => s.register);
  const [role, setRole] = useState<Exclude<UserRole, "admin">>("student");
  const [serverError, setServerError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: "", password: "", fullName: "" },
  });

  async function onSubmit(values: SignUpValues) {
    setServerError(null);
    setInfo(null);
    try {
      const u = await registerUser({ ...values, role });
      if (!u) {
        setInfo("Check your inbox to confirm your email, then sign in.");
      }
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Could not create account");
    }
  }

  return (
    <div className="space-y-5">
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
                    : "border-border hover:border-primary/40",
                )}
              >
                <span
                  className={cn(
                    "grid h-9 w-9 shrink-0 place-items-center rounded-xl",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
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
          <Label htmlFor="signup-name">
            {role === "business" ? "Your name (point of contact)" : "Full name"}
          </Label>
          <Input id="signup-name" placeholder="Amahle Ndlovu" {...register("fullName")} />
          {errors.fullName && (
            <p className="text-xs text-destructive">{errors.fullName.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-email">Email</Label>
          <Input
            id="signup-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.co.za"
            {...register("email")}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-password">Password</Label>
          <Input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 6 characters"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>
        {serverError && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {serverError}
          </p>
        )}
        {info && (
          <p className="rounded-md bg-primary/10 px-3 py-2 text-sm text-primary">{info}</p>
        )}
        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </div>
  );
}

function ForgotDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  async function send() {
    if (!email) return;
    setSending(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Reset link sent. Check your inbox.");
      onOpenChange(false);
      setEmail("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not send reset link");
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset your password</DialogTitle>
          <DialogDescription>
            We'll email you a secure link to set a new password.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="forgot-email">Email</Label>
          <Input
            id="forgot-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.co.za"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={send} disabled={sending || !email}>
            {sending ? "Sending…" : "Send reset link"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
