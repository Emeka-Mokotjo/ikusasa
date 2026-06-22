import type { AppNotification } from "@/types";

const now = Date.now();
const minsAgo = (m: number) => new Date(now - m * 60000).toISOString();

export const mockNotifications: AppNotification[] = [
  {
    id: "n_1",
    userId: "stu_1",
    kind: "application_update",
    title: "You've been shortlisted",
    body: "Kwelo Ventures shortlisted you for Frontend Engineer (Internship).",
    href: "/student/applications",
    createdAt: minsAgo(45),
    read: false,
  },
  {
    id: "n_2",
    userId: "stu_1",
    kind: "opportunity_match",
    title: "New match: SQL & Data Analyst",
    body: "3 of your skills match this role at Kwelo Ventures.",
    href: "/student/opportunities",
    createdAt: minsAgo(180),
    read: false,
  },
  {
    id: "n_3",
    userId: "stu_1",
    kind: "review_received",
    title: "Brightline Studio left you a review",
    body: "“Owned the project end-to-end. Would hire again in a heartbeat.”",
    href: "/student/reviews",
    createdAt: minsAgo(60 * 24),
    read: true,
  },
];
