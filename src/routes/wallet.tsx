import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Banknote, Wallet as WalletIcon } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { walletService } from "@/services";
import { useAuthStore } from "@/store";
import { formatZAR, formatRelativeDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { WalletTransaction } from "@/types";

export const Route = createFileRoute("/wallet")({
  head: () => ({ meta: [{ title: "Wallet — Ikusasa" }] }),
  component: WalletPage,
});

function WalletPage() {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id ?? "stu_1";
  const isBusiness = user?.role === "business";
  const qc = useQueryClient();

  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ["wallet-summary", userId],
    queryFn: () => walletService.summary(userId),
  });
  const { data: txns, isLoading: loadingTxns } = useQuery({
    queryKey: ["wallet-txns", userId],
    queryFn: () => walletService.transactions(userId),
  });

  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const withdraw = useMutation({
    mutationFn: (amt: number) => walletService.withdraw(userId, amt),
    onSuccess: () => {
      toast.success("Withdrawal requested", { description: "Funds will arrive in 1–3 business days." });
      setOpen(false);
      setAmount("");
      qc.invalidateQueries({ queryKey: ["wallet-summary"] });
      qc.invalidateQueries({ queryKey: ["wallet-txns"] });
    },
  });

  const numericAmount = Number(amount);
  const canWithdraw =
    !!summary && numericAmount > 0 && numericAmount <= summary.available && !withdraw.isPending;

  return (
    <AppShell
      title={isBusiness ? "Billing & payouts" : "Wallet & earnings"}
      description={
        isBusiness
          ? "Track payments to talent, manage milestones, and review invoices."
          : "Track what you've earned, what's pending, and withdraw to your bank."
      }
      actions={
        !isBusiness ? (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Banknote className="mr-2 h-4 w-4" /> Withdraw
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Withdraw to bank account</DialogTitle>
                <DialogDescription>
                  Available balance: <span className="font-semibold">{formatZAR(summary?.available ?? 0)}</span>
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="amt">Amount (ZAR)</label>
                <Input
                  id="amt"
                  type="number"
                  min={0}
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Payouts settle in 1–3 business days. No fees on withdrawals over R500.
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button disabled={!canWithdraw} onClick={() => withdraw.mutate(numericAmount)}>
                  Confirm withdrawal
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : null
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          tone="primary"
          label={isBusiness ? "Pending payouts" : "Available balance"}
          value={loadingSummary ? null : formatZAR(isBusiness ? summary?.pending ?? 0 : summary?.available ?? 0)}
          hint={isBusiness ? "Released on milestone completion" : "Ready to withdraw"}
        />
        <SummaryCard
          tone="muted"
          label={isBusiness ? "Released this month" : "Pending"}
          value={loadingSummary ? null : formatZAR(isBusiness ? summary?.lifetimeEarnings ?? 0 : summary?.pending ?? 0)}
          hint={isBusiness ? "Net of platform fees" : "Clears once work is approved"}
        />
        <SummaryCard
          tone="dark"
          label={isBusiness ? "Lifetime spend" : "Lifetime earnings"}
          value={loadingSummary ? null : formatZAR(summary?.lifetimeEarnings ?? 0)}
          hint={summary?.lastPayoutAt ? `Last activity ${formatRelativeDate(summary.lastPayoutAt)}` : "All time"}
        />
      </div>

      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold tracking-tight">Recent activity</h2>
        <p className="text-sm text-muted-foreground">Every transaction in your wallet.</p>
        <div className="mt-4">
          {loadingTxns ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-2xl" />
              ))}
            </div>
          ) : !txns || txns.length === 0 ? (
            <EmptyState
              icon={<WalletIcon className="h-7 w-7" />}
              title="No transactions yet"
              description="Once you complete a project, payments will appear here."
            />
          ) : (
            <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-elegant)]">
              {txns.map((t) => (
                <TxnRow key={t.id} t={t} />
              ))}
            </ul>
          )}
        </div>
      </section>
    </AppShell>
  );
}

function SummaryCard({
  tone,
  label,
  value,
  hint,
}: {
  tone: "primary" | "muted" | "dark";
  label: string;
  value: string | null;
  hint: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-5 shadow-[var(--shadow-elegant)]",
        tone === "primary" && "border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5",
        tone === "muted" && "border-border bg-card",
        tone === "dark" && "border-foreground/10 bg-foreground text-background"
      )}
    >
      <p className={cn("text-xs font-medium uppercase tracking-wider", tone === "dark" ? "text-background/60" : "text-muted-foreground")}>
        {label}
      </p>
      <p className="mt-2 font-display text-3xl font-semibold tracking-tight">
        {value ?? <Skeleton className="h-9 w-32" />}
      </p>
      <p className={cn("mt-2 text-xs", tone === "dark" ? "text-background/70" : "text-muted-foreground")}>{hint}</p>
    </div>
  );
}

function TxnRow({ t }: { t: WalletTransaction }) {
  const positive = t.amount >= 0;
  const Icon = positive ? ArrowDownLeft : ArrowUpRight;
  return (
    <li className="flex items-center gap-4 px-4 py-4 sm:px-5">
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          positive ? "bg-success/15 text-success" : "bg-muted text-foreground"
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{t.description}</p>
        <p className="truncate text-xs text-muted-foreground">
          {t.counterpartyName ? `${t.counterpartyName} · ` : ""}
          {t.opportunityTitle ? `${t.opportunityTitle} · ` : ""}
          {formatRelativeDate(t.createdAt)}
        </p>
      </div>
      <div className="text-right">
        <p className={cn("font-display text-base font-semibold", positive ? "text-success" : "text-foreground")}>
          {positive ? "+" : "−"}
          {formatZAR(Math.abs(t.amount))}
        </p>
        <p className={cn(
          "text-[10px] font-medium uppercase tracking-wider",
          t.status === "completed" ? "text-muted-foreground" : t.status === "pending" ? "text-chart-4" : "text-destructive"
        )}>
          {t.status}
        </p>
      </div>
    </li>
  );
}
