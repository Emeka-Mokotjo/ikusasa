import { Link } from "@tanstack/react-router";
import { Clock, MapPin, Users, Wifi } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { OPPORTUNITY_TYPE_LABEL } from "@/constants";
import { formatRelativeDate, formatZAR, initials } from "@/lib/format";
import type { Opportunity } from "@/types";

export function OpportunityCard({ opp }: { opp: Opportunity }) {
  return (
    <Link
      to="/opportunities/$opportunityId"
      params={{ opportunityId: opp.id }}
      className="group flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-elegant)] transition-all hover:-translate-y-0.5 hover:border-primary/40"
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarFallback className="bg-accent text-accent-foreground text-xs font-semibold">
            {initials(opp.businessName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-muted-foreground">{opp.businessName}</p>
          <h3 className="mt-0.5 line-clamp-2 font-display text-base font-semibold text-foreground group-hover:text-primary">
            {opp.title}
          </h3>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <Badge variant="secondary" className="rounded-full font-medium">
          {OPPORTUNITY_TYPE_LABEL[opp.type]}
        </Badge>
        {opp.remote && (
          <Badge variant="outline" className="rounded-full gap-1 font-medium">
            <Wifi className="h-3 w-3" /> Remote
          </Badge>
        )}
        {opp.skills.slice(0, 2).map((s) => (
          <Badge key={s} variant="outline" className="rounded-full font-medium">
            {s}
          </Badge>
        ))}
        {opp.skills.length > 2 && (
          <Badge variant="outline" className="rounded-full font-medium">
            +{opp.skills.length - 2}
          </Badge>
        )}
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{opp.description}</p>

      <div className="mt-auto flex items-end justify-between pt-4">
        <div>
          <p className="font-display text-lg font-semibold text-foreground">
            {formatZAR(opp.compensationAmount, { compact: true })}
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              {opp.compensationType === "hourly"
                ? "/hr"
                : opp.compensationType === "stipend"
                  ? "/mo stipend"
                  : opp.compensationType === "unpaid"
                    ? ""
                    : "fixed"}
            </span>
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" /> {opp.location}
          </p>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <p className="flex items-center justify-end gap-1">
            <Users className="h-3 w-3" /> {opp.applicantCount}
          </p>
          <p className="mt-1 flex items-center justify-end gap-1">
            <Clock className="h-3 w-3" /> {formatRelativeDate(opp.postedAt)}
          </p>
        </div>
      </div>
    </Link>
  );
}
