import type { WalletSummary, WalletTransaction } from "@/types";

const now = Date.now();
const days = (d: number) => new Date(now - d * 86400000).toISOString();

export const mockWalletTransactions: WalletTransaction[] = [
  {
    id: "tx_1",
    userId: "stu_1",
    type: "earning",
    status: "completed",
    amount: 4500,
    description: "Project payment",
    counterpartyName: "Brightline Studio",
    opportunityTitle: "UI Design Sprint",
    createdAt: days(3),
  },
  {
    id: "tx_2",
    userId: "stu_1",
    type: "earning",
    status: "pending",
    amount: 2200,
    description: "Milestone payout",
    counterpartyName: "Kwelo Ventures",
    opportunityTitle: "Frontend Engineer (Internship)",
    createdAt: days(1),
  },
  {
    id: "tx_3",
    userId: "stu_1",
    type: "withdrawal",
    status: "completed",
    amount: -3000,
    description: "Withdrawal to FNB ****1234",
    createdAt: days(10),
  },
  {
    id: "tx_4",
    userId: "stu_1",
    type: "fee",
    status: "completed",
    amount: -135,
    description: "Service fee",
    opportunityTitle: "UI Design Sprint",
    createdAt: days(3),
  },
  {
    id: "tx_5",
    userId: "grad_1",
    type: "earning",
    status: "completed",
    amount: 7800,
    description: "Project payment",
    counterpartyName: "Sasol Ventures Lab",
    opportunityTitle: "Analytics consult",
    createdAt: days(5),
  },
  // Business side (payouts / charges)
  {
    id: "tx_b1",
    userId: "biz_1",
    type: "charge",
    status: "completed",
    amount: -4500,
    description: "Payment to Brightline freelancer",
    counterpartyName: "Amahle Ndlovu",
    opportunityTitle: "Frontend Engineer (Internship)",
    createdAt: days(3),
  },
  {
    id: "tx_b2",
    userId: "biz_1",
    type: "payout",
    status: "pending",
    amount: -2200,
    description: "Milestone release",
    counterpartyName: "Amahle Ndlovu",
    createdAt: days(1),
  },
];

export const mockWalletSummary: Record<string, WalletSummary> = {
  stu_1: { available: 6850, pending: 2200, lifetimeEarnings: 22400, lastPayoutAt: days(10) },
  stu_2: { available: 0, pending: 0, lifetimeEarnings: 0 },
  stu_3: { available: 1200, pending: 0, lifetimeEarnings: 3600 },
  grad_1: { available: 12400, pending: 1500, lifetimeEarnings: 48200, lastPayoutAt: days(14) },
  grad_2: { available: 800, pending: 0, lifetimeEarnings: 16400 },
  biz_1: { available: 0, pending: 2200, lifetimeEarnings: 0 },
};
