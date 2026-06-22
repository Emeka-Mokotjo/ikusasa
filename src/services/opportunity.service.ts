import { delay } from "./_delay";
import { mockOpportunities } from "@/mock-data/opportunities";
import type { Opportunity } from "@/types";

export interface OpportunityFilters {
  search?: string;
  type?: Opportunity["type"];
  remote?: boolean;
  city?: string;
  skills?: string[];
  minCompensation?: number;
}

export const opportunityService = {
  async list(filters: OpportunityFilters = {}): Promise<Opportunity[]> {
    let items = [...mockOpportunities];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(
        (o) =>
          o.title.toLowerCase().includes(q) ||
          o.businessName.toLowerCase().includes(q) ||
          o.skills.some((s) => s.toLowerCase().includes(q))
      );
    }
    if (filters.type) items = items.filter((o) => o.type === filters.type);
    if (filters.remote !== undefined) items = items.filter((o) => o.remote === filters.remote);
    if (filters.city) items = items.filter((o) => o.location === filters.city);
    if (filters.skills?.length) {
      items = items.filter((o) => filters.skills!.some((s) => o.skills.includes(s)));
    }
    if (filters.minCompensation !== undefined) {
      items = items.filter((o) => o.compensationAmount >= filters.minCompensation!);
    }
    return delay(items);
  },
  async byId(id: string): Promise<Opportunity | undefined> {
    return delay(mockOpportunities.find((o) => o.id === id));
  },
  async recommended(_userId: string, limit = 4): Promise<Opportunity[]> {
    return delay(mockOpportunities.slice(0, limit));
  },
  async byBusinessId(businessId: string): Promise<Opportunity[]> {
    return delay(mockOpportunities.filter((o) => o.businessId === businessId));
  },
};
