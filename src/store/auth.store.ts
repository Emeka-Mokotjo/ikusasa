import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User, UserRole } from "@/types";
import { authService, type LoginInput, type RegisterInput } from "@/services/auth.service";

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (input: LoginInput) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (patch: Partial<User>) => void;
  setRole: (role: UserRole) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      async login(input) {
        set({ loading: true });
        try {
          const user = await authService.login(input);
          set({ user });
          return user;
        } finally {
          set({ loading: false });
        }
      },
      async register(input) {
        set({ loading: true });
        try {
          const user = await authService.register(input);
          set({ user });
          return user;
        } finally {
          set({ loading: false });
        }
      },
      async logout() {
        await authService.logout();
        set({ user: null });
      },
      updateUser(patch) {
        const current = get().user;
        if (!current) return;
        set({ user: { ...current, ...patch } as User });
      },
      setRole(_role) {
        // role is part of the user object; helper kept for future flows
      },
    }),
    { name: "ikusasa-auth", storage: createJSONStorage(() => localStorage) }
  )
);
