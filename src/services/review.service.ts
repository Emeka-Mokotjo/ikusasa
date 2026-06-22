import { delay } from "./_delay";
import { mockReviews } from "@/mock-data/reviews";
import type { Review } from "@/types";

export const reviewService = {
  async bySubjectId(subjectId: string): Promise<Review[]> {
    return delay(mockReviews.filter((r) => r.subjectId === subjectId));
  },
  async byAuthorId(authorId: string): Promise<Review[]> {
    return delay(mockReviews.filter((r) => r.authorId === authorId));
  },
};
