import { create } from "zustand";
import type { UserRole } from "@/types";

export interface StudentOnboardingData {
  fullName: string;
  university: string;
  degree: string;
  graduationYear: number;
  city: string;
  skills: string[];
  linkedin: string;
  github: string;
  website: string;
  cvFileName?: string;
}

export interface GraduateOnboardingData extends StudentOnboardingData {
  yearsSinceGraduation: number;
  currentRole: string;
}

export interface BusinessOnboardingData {
  companyName: string;
  industry: string;
  website: string;
  city: string;
  description: string;
  registrationNumber: string;
  documents: string[];
}

interface OnboardingState {
  step: number;
  role: UserRole | null;
  student: Partial<StudentOnboardingData>;
  graduate: Partial<GraduateOnboardingData>;
  business: Partial<BusinessOnboardingData>;
  setStep: (n: number) => void;
  next: () => void;
  back: () => void;
  setStudent: (patch: Partial<StudentOnboardingData>) => void;
  setGraduate: (patch: Partial<GraduateOnboardingData>) => void;
  setBusiness: (patch: Partial<BusinessOnboardingData>) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  step: 1,
  role: null,
  student: {},
  graduate: {},
  business: {},
  setStep: (n) => set({ step: n }),
  next: () => set((s) => ({ step: s.step + 1 })),
  back: () => set((s) => ({ step: Math.max(1, s.step - 1) })),
  setStudent: (patch) => set((s) => ({ student: { ...s.student, ...patch } })),
  setGraduate: (patch) => set((s) => ({ graduate: { ...s.graduate, ...patch } })),
  setBusiness: (patch) => set((s) => ({ business: { ...s.business, ...patch } })),
  reset: () => set({ step: 1, student: {}, graduate: {}, business: {} }),
}));
