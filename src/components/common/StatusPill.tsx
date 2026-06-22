import { cn } from "@/lib/utils";
import type { ApplicationStatus, OpportunityStatus } from "@/types";
import { APPLICATION_STATUS_LABEL } from "@/constants";

const APP_STYLES: Record<ApplicationStatus, string> = {
  submitted: "bg-muted text-muted-foreground",
  shortlisted: "bg-accent text-accent-foreground",
  interview: "bg-chart-4/15 text-chart-4",
  accepted: "bg-success/15 text-success",
  rejected: "bg-destructive/10 text-destructive",
  withdrawn: "bg-muted text-muted-foreground",
};

const OPP_STYLES: Record<OpportunityStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  open: "bg-success/15 text-success",
  closed: "bg-muted text-muted-foreground",
  filled: "bg-chart-4/15 text-chart-4",
};

export function ApplicationStatusPill({ status }: { status: ApplicationStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        APP_STYLES[status]
      )}
    >
      {APPLICATION_STATUS_LABEL[status]}
    </span>
  );
}

export function OpportunityStatusPill({ status }: { status: OpportunityStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        OPP_STYLES[status]
      )}
    >
      {status}
    </span>
  );
}
