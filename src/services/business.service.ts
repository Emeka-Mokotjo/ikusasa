import { delay } from "./_delay";
import { mockBusinesses } from "@/mock-data/businesses";
import type { Business } from "@/types";

export const businessService = {
  async list(): Promise<Business[]> {
    return delay(mockBusinesses);
  },
  async byId(id: string): Promise<Business | undefined> {
    return delay(mockBusinesses.find((b) => b.id === id));
  },
};
