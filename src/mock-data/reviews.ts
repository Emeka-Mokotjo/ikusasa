import type { Review } from "@/types";

export const mockReviews: Review[] = [
  {
    id: "rev_1",
    subjectId: "stu_1",
    subjectType: "student",
    authorId: "biz_2",
    authorName: "Brightline Studio",
    rating: 5,
    comment: "Owned the project end-to-end. Would hire again in a heartbeat.",
    createdAt: "2025-10-20T09:00:00Z",
    opportunityTitle: "Frontend prototype build",
  },
  {
    id: "rev_2",
    subjectId: "biz_1",
    subjectType: "business",
    authorId: "grad_1",
    authorName: "Nomsa Khumalo",
    rating: 5,
    comment: "Clear briefs, fast payments, supportive team. Great first freelance experience.",
    createdAt: "2025-09-12T09:00:00Z",
  },
  {
    id: "rev_3",
    subjectId: "grad_2",
    subjectType: "graduate",
    authorId: "biz_5",
    authorName: "Yebo Studios",
    rating: 4,
    comment: "Strong editor — minor turnaround misses but fixed quickly.",
    createdAt: "2025-08-30T09:00:00Z",
  },
];
