import { delay } from "./_delay";
import { mockStudents, mockGraduates } from "@/mock-data/students";
import type { Student, Graduate } from "@/types";

export const studentService = {
  async list(): Promise<Student[]> {
    return delay(mockStudents);
  },
  async byId(id: string): Promise<Student | undefined> {
    return delay(mockStudents.find((s) => s.id === id));
  },
};

export const graduateService = {
  async list(): Promise<Graduate[]> {
    return delay(mockGraduates);
  },
  async byId(id: string): Promise<Graduate | undefined> {
    return delay(mockGraduates.find((g) => g.id === id));
  },
};
