import { delay } from "./_delay";
import { mockApplications } from "@/mock-data/applications";
import type { Application, ApplicationStatus } from "@/types";


export const applicationService = {
  async byApplicantId(applicantId: string): Promise<Application[]> {
    return delay(mockApplications.filter((a) => a.applicantId === applicantId));
  },
  async byOpportunityId(opportunityId: string): Promise<Application[]> {
    return delay(mockApplications.filter((a) => a.opportunityId === opportunityId));
  },
  async byBusinessId(_businessId: string): Promise<Application[]> {
    return delay(mockApplications);
  },
  async submit(input: {
    opportunityId: string;
    applicantId: string;
    coverMessage: string;
    portfolioLink?: string;
    cvFileName?: string;
  }): Promise<Application> {
    return delay({
      id: `app_${Math.random().toString(36).slice(2, 9)}`,
      opportunityId: input.opportunityId,
      opportunityTitle: "—",
      businessName: "—",
      applicantId: input.applicantId,
      applicantName: "You",
      applicantRole: "student",
      coverMessage: input.coverMessage,
      portfolioLink: input.portfolioLink,
      cvFileName: input.cvFileName,
      status: "submitted",
      submittedAt: new Date().toISOString(),
    });
  },
};
