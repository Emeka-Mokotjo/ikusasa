import { delay } from "./_delay";
import { mockStudents, mockGraduates } from "@/mock-data/students";
import { mockBusinesses } from "@/mock-data/businesses";
import { mockOpportunities } from "@/mock-data/opportunities";
import { mockApplications } from "@/mock-data/applications";
import type { AdminStats, Business, Opportunity } from "@/types";

function signupSeries(): number[] {
  // Deterministic 7-day series
  return [4, 7, 5, 9, 12, 8, 14];
}

export const adminService = {
  async stats(): Promise<AdminStats> {
    const totalStudents = mockStudents.length;
    const totalGraduates = mockGraduates.length;
    const totalBusinesses = mockBusinesses.length;
    return delay({
      totalUsers: totalStudents + totalGraduates + totalBusinesses,
      totalStudents,
      totalGraduates,
      totalBusinesses,
      totalOpportunities: mockOpportunities.length,
      openOpportunities: mockOpportunities.filter((o) => o.status === "open").length,
      totalApplications: mockApplications.length,
      pendingVerifications: mockBusinesses.filter((b) => !b.verified).length,
      flaggedItems: 2,
      signupsLast7Days: signupSeries(),
    });
  },
  async pendingBusinesses(): Promise<Business[]> {
    return delay(mockBusinesses.filter((b) => !b.verified));
  },
  async approveBusiness(id: string): Promise<void> {
    const b = mockBusinesses.find((x) => x.id === id);
    if (b) b.verified = true;
    return delay(undefined, 200);
  },
  async recentOpportunities(): Promise<Opportunity[]> {
    return delay(
      [...mockOpportunities].sort((a, b) => b.postedAt.localeCompare(a.postedAt)).slice(0, 8)
    );
  },
};
