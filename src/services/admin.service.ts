import { delay } from "./_delay";
import { mockStudents, mockGraduates } from "@/mock-data/students";
import { mockBusinesses } from "@/mock-data/businesses";
import { mockOpportunities } from "@/mock-data/opportunities";
import { mockApplications } from "@/mock-data/applications";
import { mockDisputes } from "@/mock-data/disputes";
import { mockWalletTransactions } from "@/mock-data/wallet";
import type {
  AdminStats,
  Business,
  Dispute,
  DisputeStatus,
  Opportunity,
  Placement,
  UserRole,
  WalletTransaction,
} from "@/types";

function signupSeries(): number[] {
  return [4, 7, 5, 9, 12, 8, 14];
}

export interface AdminUserRow {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  city?: string;
  createdAt: string;
  verified?: boolean;
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
      flaggedItems: mockDisputes.filter((d) => d.status === "open").length,
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
  async allBusinesses(): Promise<Business[]> {
    return delay([...mockBusinesses].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  },
  async recentOpportunities(): Promise<Opportunity[]> {
    return delay(
      [...mockOpportunities].sort((a, b) => b.postedAt.localeCompare(a.postedAt)).slice(0, 8)
    );
  },
  async allUsers(): Promise<AdminUserRow[]> {
    const users: AdminUserRow[] = [
      ...mockStudents.map((s) => ({
        id: s.id,
        fullName: s.fullName,
        email: s.email,
        role: s.role,
        city: s.city,
        createdAt: s.createdAt,
      })),
      ...mockGraduates.map((g) => ({
        id: g.id,
        fullName: g.fullName,
        email: g.email,
        role: g.role,
        city: g.city,
        createdAt: g.createdAt,
      })),
      ...mockBusinesses.map((b) => ({
        id: b.id,
        fullName: b.fullName,
        email: b.email,
        role: b.role,
        city: b.city,
        createdAt: b.createdAt,
        verified: b.verified,
      })),
    ].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return delay(users);
  },
  async disputes(): Promise<Dispute[]> {
    return delay([...mockDisputes].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  },
  async updateDispute(id: string, status: DisputeStatus): Promise<void> {
    const d = mockDisputes.find((x) => x.id === id);
    if (d) d.status = status;
    return delay(undefined, 200);
  },
  async placements(): Promise<Placement[]> {
    const accepted = mockApplications.filter((a) => a.status === "accepted");
    const list: Placement[] = accepted.map((a, i) => {
      const opp = mockOpportunities.find((o) => o.id === a.opportunityId);
      return {
        id: `pl_${a.id}`,
        applicantName: a.applicantName,
        applicantRole: a.applicantRole,
        businessName: a.businessName,
        opportunityTitle: a.opportunityTitle,
        startedAt: a.submittedAt,
        compensationAmount: opp?.compensationAmount ?? 0,
        status: i % 2 === 0 ? "active" : "completed",
      };
    });
    // Add some seeded placements for richer display
    list.push(
      {
        id: "pl_seed_1",
        applicantName: "Amahle Ndlovu",
        applicantRole: "student",
        businessName: "Brightline Studio",
        opportunityTitle: "UI Design Sprint",
        startedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
        compensationAmount: 4500,
        status: "completed",
      },
      {
        id: "pl_seed_2",
        applicantName: "Nomsa Khumalo",
        applicantRole: "graduate",
        businessName: "Sasol Ventures Lab",
        opportunityTitle: "Analytics consult",
        startedAt: new Date(Date.now() - 9 * 86400000).toISOString(),
        compensationAmount: 7800,
        status: "active",
      }
    );
    return delay(list);
  },
  async payouts(): Promise<WalletTransaction[]> {
    const list = mockWalletTransactions.filter(
      (t) => t.type === "payout" || t.type === "withdrawal" || t.type === "charge"
    );
    return delay([...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  },
};
