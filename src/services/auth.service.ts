import { delay } from "./_delay";
import { mockUsers, mockAdmin } from "@/mock-data/users";
import type { User, UserRole, Student, Graduate, Business } from "@/types";

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  role: Exclude<UserRole, "admin">;
}

function makeNewUser(input: RegisterInput): User {
  const id = `usr_${Math.random().toString(36).slice(2, 9)}`;
  const base = {
    id,
    email: input.email,
    fullName: input.fullName,
    onboardingComplete: false,
    createdAt: new Date().toISOString(),
  };
  if (input.role === "student") {
    return {
      ...base,
      role: "student",
      university: "",
      degree: "",
      graduationYear: new Date().getFullYear() + 1,
      skills: [],
      portfolio: {},
    } satisfies Student;
  }
  if (input.role === "graduate") {
    return {
      ...base,
      role: "graduate",
      university: "",
      degree: "",
      graduationYear: new Date().getFullYear() - 1,
      yearsSinceGraduation: 1,
      skills: [],
      portfolio: {},
    } satisfies Graduate;
  }
  return {
    ...base,
    role: "business",
    companyName: "",
    industry: "",
    description: "",
    verified: false,
  } satisfies Business;
}

export const authService = {
  async login(input: LoginInput): Promise<User> {
    const user =
      mockUsers.find((u) => u.email.toLowerCase() === input.email.toLowerCase()) ?? mockUsers[0];
    return delay(user);
  },
  async register(input: RegisterInput): Promise<User> {
    return delay(makeNewUser(input));
  },
  async forgotPassword(_email: string): Promise<{ ok: true }> {
    return delay({ ok: true } as const, 500);
  },
  async loginAsAdmin(): Promise<User> {
    return delay(mockAdmin);
  },
  async logout(): Promise<void> {
    return delay(undefined, 100);
  },
};
