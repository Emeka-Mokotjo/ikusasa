import { delay } from "./_delay";
import { mockNotifications } from "@/mock-data/notifications";
import type { AppNotification } from "@/types";

export const notificationService = {
  async byUserId(userId: string): Promise<AppNotification[]> {
    return delay(mockNotifications.filter((n) => n.userId === userId || userId === "stu_1"));
  },
  async markRead(id: string): Promise<void> {
    const n = mockNotifications.find((x) => x.id === id);
    if (n) n.read = true;
    return delay(undefined, 100);
  },
};
