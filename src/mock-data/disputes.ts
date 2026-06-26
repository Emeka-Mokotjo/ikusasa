import type { Dispute } from "@/types";

const now = Date.now();
const days = (d: number) => new Date(now - d * 86400000).toISOString();

export const mockDisputes: Dispute[] = [
  {
    id: "dis_1",
    opportunityTitle: "Brand Designer — Short Project",
    raisedByName: "Tasha van Wyk",
    raisedByRole: "student",
    againstName: "Brightline Studio",
    reason: "Milestone marked complete but payment not released after 7 days.",
    amount: 3500,
    status: "open",
    createdAt: days(2),
  },
  {
    id: "dis_2",
    opportunityTitle: "Video Editor — Freelance",
    raisedByName: "Yebo Studios",
    raisedByRole: "business",
    againstName: "Kabelo Maseko",
    reason: "Final deliverable does not match the agreed brief.",
    amount: 6800,
    status: "in_review",
    createdAt: days(5),
  },
  {
    id: "dis_3",
    opportunityTitle: "Matric Maths Tutor (Part-time)",
    raisedByName: "Sipho Mahlangu",
    raisedByRole: "student",
    againstName: "Finya Edu",
    reason: "Hours logged disputed by client.",
    amount: 1200,
    status: "resolved",
    createdAt: days(12),
  },
  {
    id: "dis_4",
    opportunityTitle: "Research Analyst — Energy Transition",
    raisedByName: "Sasol Ventures Lab",
    raisedByRole: "business",
    againstName: "Nomsa Khumalo",
    reason: "Scope creep — additional report requested beyond contract.",
    status: "rejected",
    createdAt: days(20),
  },
];
