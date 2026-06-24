import { delay } from "./_delay";
import { mockReviews } from "@/mock-data/reviews";
import type { Review } from "@/types";

let reviews = [...mockReviews];

export interface SubmitReviewInput {
  subjectId: string;
  subjectType: Review["subjectType"];
  authorId: string;
  authorName: string;
  rating: number;
  comment: string;
  opportunityTitle?: string;
}

export const reviewService = {
  async bySubjectId(subjectId: string): Promise<Review[]> {
    return delay(reviews.filter((r) => r.subjectId === subjectId));
  },
  async byAuthorId(authorId: string): Promise<Review[]> {
    return delay(reviews.filter((r) => r.authorId === authorId));
  },
  async summaryFor(subjectId: string): Promise<{ count: number; average: number }> {
    const list = reviews.filter((r) => r.subjectId === subjectId);
    const count = list.length;
    const average = count ? list.reduce((s, r) => s + r.rating, 0) / count : 0;
    return delay({ count, average });
  },
  async submit(input: SubmitReviewInput): Promise<Review> {
    const review: Review = {
      id: `rev_${Math.random().toString(36).slice(2, 9)}`,
      createdAt: new Date().toISOString(),
      ...input,
    };
    reviews = [review, ...reviews];
    return delay(review, 400);
  },
};
