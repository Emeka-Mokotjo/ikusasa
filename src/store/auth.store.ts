import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
import type { User, UserRole } from "@/types";

interface LoginInput {
  email: string;
  password: string;
}

interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  role: Exclude<UserRole, "admin">;
}

interface AuthState {
  user: User | null;
  initializing: boolean;
  loading: boolean;
  login: (input: LoginInput) => Promise<User>;
  register: (input: RegisterInput) => Promise<User | null>;
  logout: () => Promise<void>;
  updateUser: (patch: Partial<User>) => void;
  setRole: (role: UserRole) => void;
  refresh: () => Promise<void>;
}

const ONBOARDING_KEY = "ikusasa-onboarded";

function onboardedSet(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    return new Set(JSON.parse(localStorage.getItem(ONBOARDING_KEY) ?? "[]") as string[]);
  } catch {
    return new Set();
  }
}

function markOnboarded(id: string) {
  if (typeof window === "undefined") return;
  const s = onboardedSet();
  s.add(id);
  localStorage.setItem(ONBOARDING_KEY, JSON.stringify([...s]));
}

async function hydrateUser(): Promise<User | null> {
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return null;

  const [{ data: profile }, { data: roleRow }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", authUser.id)
      .maybeSingle(),
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", authUser.id)
      .limit(1)
      .maybeSingle(),
  ]);

  const role = (roleRow?.role ?? "student") as UserRole;
  const fullName =
    profile?.full_name ||
    (authUser.user_metadata?.full_name as string | undefined) ||
    authUser.email?.split("@")[0] ||
    "User";

  return {
    id: authUser.id,
    email: authUser.email ?? "",
    role,
    fullName,
    avatarUrl: profile?.avatar_url ?? undefined,
    createdAt: authUser.created_at ?? new Date().toISOString(),
    onboardingComplete: onboardedSet().has(authUser.id),
  } as unknown as User;
}

let hydratePromise: Promise<void> | null = null;

export async function ensureAuthLoaded(): Promise<void> {
  if (hydratePromise) return hydratePromise;
  hydratePromise = (async () => {
    try {
      const u = await hydrateUser();
      useAuthStore.setState({ user: u, initializing: false });
    } catch (e) {
      console.error("[auth] hydrate failed", e);
      useAuthStore.setState({ user: null, initializing: false });
    }
  })();
  return hydratePromise;
}

export function resetAuthHydration() {
  hydratePromise = null;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  initializing: true,
  loading: false,

  async login(input) {
    set({ loading: true });
    try {
      const { error } = await supabase.auth.signInWithPassword(input);
      if (error) throw error;
      resetAuthHydration();
      await ensureAuthLoaded();
      const u = get().user;
      if (!u) throw new Error("Signed in but could not load profile.");
      return u;
    } finally {
      set({ loading: false });
    }
  },

  async register(input) {
    set({ loading: true });
    try {
      const emailRedirectTo =
        typeof window !== "undefined" ? `${window.location.origin}/auth` : undefined;
      const { data, error } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          emailRedirectTo,
          data: { full_name: input.fullName, role: input.role },
        },
      });
      if (error) throw error;
      if (!data.session) {
        // Email confirmation required — no session yet.
        return null;
      }
      resetAuthHydration();
      await ensureAuthLoaded();
      return get().user;
    } finally {
      set({ loading: false });
    }
  },

  async logout() {
    await supabase.auth.signOut();
    resetAuthHydration();
    set({ user: null });
  },

  updateUser(patch) {
    const cur = get().user;
    if (!cur) return;
    if (patch.onboardingComplete) markOnboarded(cur.id);
    set({ user: { ...cur, ...patch } as User });
  },

  setRole() {
    // Roles are server-managed; this is a no-op kept for legacy callers.
  },

  async refresh() {
    resetAuthHydration();
    await ensureAuthLoaded();
  },
}));
