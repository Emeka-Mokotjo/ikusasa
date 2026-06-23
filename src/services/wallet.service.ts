import { delay } from "./_delay";
import { mockWalletSummary, mockWalletTransactions } from "@/mock-data/wallet";
import type { WalletSummary, WalletTransaction } from "@/types";

const defaultSummary: WalletSummary = {
  available: 0,
  pending: 0,
  lifetimeEarnings: 0,
};

export const walletService = {
  async summary(userId: string): Promise<WalletSummary> {
    return delay(mockWalletSummary[userId] ?? defaultSummary);
  },
  async transactions(userId: string): Promise<WalletTransaction[]> {
    const list = mockWalletTransactions.filter((t) => t.userId === userId);
    return delay(
      (list.length ? list : mockWalletTransactions.filter((t) => t.userId === "stu_1")).sort(
        (a, b) => b.createdAt.localeCompare(a.createdAt)
      )
    );
  },
  async withdraw(userId: string, amount: number): Promise<WalletTransaction> {
    const tx: WalletTransaction = {
      id: `tx_${Date.now()}`,
      userId,
      type: "withdrawal",
      status: "pending",
      amount: -Math.abs(amount),
      description: "Withdrawal to bank account",
      createdAt: new Date().toISOString(),
    };
    mockWalletTransactions.push(tx);
    const s = mockWalletSummary[userId];
    if (s) s.available = Math.max(0, s.available - Math.abs(amount));
    return delay(tx, 400);
  },
};
