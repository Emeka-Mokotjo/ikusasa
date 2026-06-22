import { mockStudents, mockGraduates } from "./students";
import { mockBusinesses } from "./businesses";
import type { User } from "@/types";

export const mockUsers: User[] = [...mockStudents, ...mockGraduates, ...mockBusinesses];

export const mockAdmin: User = {
  id: "admin_1",
  role: "admin",
  email: "admin@ikusasa.co.za",
  fullName: "Ikusasa Admin",
  onboardingComplete: true,
  createdAt: "2025-01-01T00:00:00Z",
};
