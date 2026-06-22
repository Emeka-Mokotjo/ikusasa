import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { TagInput } from "@/components/forms/TagInput";
import { OPPORTUNITY_TYPE_LABEL, SA_CITIES, SKILLS_CATALOG } from "@/constants";
import type { CompensationType, OpportunityType } from "@/types";

export const Route = createFileRoute("/business/opportunities/new")({
  head: () => ({ meta: [{ title: "Post a role — Ikusasa" }] }),
  component: NewOpportunityPage,
});

const TYPE_OPTIONS: OpportunityType[] = [
  "freelance",
  "internship",
  "part-time",
  "entry-level",
  "short-project",
];

function NewOpportunityPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [type, setType] = useState<OpportunityType>("internship");
  const [location, setLocation] = useState("Cape Town");
  const [remote, setRemote] = useState(true);
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [compensationType, setCompensationType] = useState<CompensationType>("fixed");
  const [compensationAmount, setCompensationAmount] = useState("");
  const [durationWeeks, setDurationWeeks] = useState("8");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || skills.length === 0 || !compensationAmount) {
      toast.error("Fill out the role, description, skills, and compensation.");
      return;
    }
    setSubmitting(true);
    // mock latency
    await new Promise((r) => setTimeout(r, 700));
    toast.success("Opportunity posted", {
      description: "Your role is now live and visible to candidates.",
    });
    setSubmitting(false);
    navigate({ to: "/business/opportunities" });
  };

  return (
    <AppShell
      title="Post a new role"
      description="Reach thousands of vetted students and graduates across South Africa."
      actions={
        <Button variant="ghost" onClick={() => navigate({ to: "/business/opportunities" })}>
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
        </Button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-5 rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-elegant)] sm:p-8"
        >
          <div>
            <Label htmlFor="title">Role title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Junior Frontend Engineer"
              className="mt-1.5"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as OpportunityType)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {OPPORTUNITY_TYPE_LABEL[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Location</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SA_CITIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
            <Switch id="remote" checked={remote} onCheckedChange={setRemote} />
            <Label htmlFor="remote" className="cursor-pointer text-sm">
              Open to remote candidates
            </Label>
          </div>

          <div>
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              placeholder="Describe the role, day-to-day, and what success looks like."
              className="mt-1.5"
            />
          </div>

          <div>
            <Label>Required skills</Label>
            <TagInput
              value={skills}
              onChange={setSkills}
              suggestions={SKILLS_CATALOG}
              placeholder="Type a skill and press enter"
              className="mt-1.5"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <Label>Compensation type</Label>
              <Select
                value={compensationType}
                onValueChange={(v) => setCompensationType(v as CompensationType)}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="stipend">Stipend (monthly)</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-1">
              <Label htmlFor="amount">Amount (ZAR)</Label>
              <Input
                id="amount"
                inputMode="numeric"
                value={compensationAmount}
                onChange={(e) => setCompensationAmount(e.target.value.replace(/[^\d]/g, ""))}
                placeholder="12000"
                className="mt-1.5"
              />
            </div>
            <div className="sm:col-span-1">
              <Label htmlFor="duration">Duration (weeks)</Label>
              <Input
                id="duration"
                inputMode="numeric"
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(e.target.value.replace(/[^\d]/g, ""))}
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border pt-5">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate({ to: "/business/opportunities" })}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="shadow-[var(--shadow-coral)]">
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Publish opportunity
            </Button>
          </div>
        </form>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="h-4 w-4" />
              <p className="text-sm font-semibold">Tips for great posts</p>
            </div>
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
              <li>• Be specific about deliverables and day-to-day work.</li>
              <li>• Share compensation transparently — it doubles application rates.</li>
              <li>• Highlight what early-career talent will learn.</li>
              <li>• Reply within 48 hours to keep your hiring health high.</li>
            </ul>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
