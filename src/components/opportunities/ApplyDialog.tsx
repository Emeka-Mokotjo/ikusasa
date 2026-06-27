import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { applicationService } from "@/services";
import type { Opportunity } from "@/types";
import { useAuthStore } from "@/store";

export function ApplyDialog({
  open,
  onOpenChange,
  opp,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  opp: Opportunity;
}) {
  const user = useAuthStore((s) => s.user);
  const [coverMessage, setCoverMessage] = useState("");
  const [portfolioLink, setPortfolioLink] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user || (user.role !== "student" && user.role !== "graduate")) {
      toast.error("Only students and graduates can apply to opportunities.");
      return;
    }
    if (coverMessage.trim().length < 20) {
      toast.error("Add at least a couple of sentences so the team can get to know you.");
      return;
    }

    setSubmitting(true);
    try {
      await applicationService.submit({
        opportunityId: opp.id,
        applicantId: user?.id ?? "guest",
        coverMessage,
        portfolioLink: portfolioLink || undefined,
      });
      toast.success("Application sent", {
        description: `${opp.businessName} will review and get back to you.`,
      });
      onOpenChange(false);
      setCoverMessage("");
      setPortfolioLink("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Apply to {opp.title}</DialogTitle>
          <DialogDescription>
            Tell {opp.businessName} why you're a fit. Keep it short and specific.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="cover">Cover message</Label>
            <Textarea
              id="cover"
              value={coverMessage}
              onChange={(e) => setCoverMessage(e.target.value)}
              rows={6}
              placeholder="What relevant work have you done? Why this role?"
              className="mt-1.5"
            />
            <p className="mt-1 text-xs text-muted-foreground">{coverMessage.length} characters</p>
          </div>
          <div>
            <Label htmlFor="portfolio">Portfolio link (optional)</Label>
            <Input
              id="portfolio"
              value={portfolioLink}
              onChange={(e) => setPortfolioLink(e.target.value)}
              placeholder="https://"
              className="mt-1.5"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit application
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
