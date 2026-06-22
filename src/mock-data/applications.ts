import type { Application } from "@/types";

const now = Date.now();
const daysAgo = (d: number) => new Date(now - d * 86400000).toISOString();

export const mockApplications: Application[] = [
  {
    id: "app_1",
    opportunityId: "opp_1",
    opportunityTitle: "Frontend Engineer (Internship)",
    businessName: "Kwelo Ventures",
    applicantId: "stu_1",
    applicantName: "Amahle Ndlovu",
    applicantRole: "student",
    coverMessage:
      "I've shipped two React side-projects this year and would love to learn fintech inside a real product team.",
    portfolioLink: "https://github.com/amahle",
    cvFileName: "amahle-ndlovu-cv.pdf",
    status: "shortlisted",
    submittedAt: daysAgo(1),
  },
  {
    id: "app_2",
    opportunityId: "opp_4",
    opportunityTitle: "Research Analyst — Energy Transition",
    businessName: "Sasol Ventures Lab",
    applicantId: "grad_1",
    applicantName: "Nomsa Khumalo",
    applicantRole: "graduate",
    coverMessage:
      "My final-year project mapped renewable adoption across SA municipalities — happy to share the report.",
    cvFileName: "nomsa-khumalo-cv.pdf",
    status: "interview",
    submittedAt: daysAgo(5),
  },
  {
    id: "app_3",
    opportunityId: "opp_2",
    opportunityTitle: "Brand Designer — Short Project",
    businessName: "Brightline Studio",
    applicantId: "stu_3",
    applicantName: "Tasha van Wyk",
    applicantRole: "student",
    coverMessage: "Sharing my latest identity work — would love to discuss the brief.",
    portfolioLink: "https://tasha.design",
    status: "submitted",
    submittedAt: daysAgo(0),
  },
  {
    id: "app_4",
    opportunityId: "opp_5",
    opportunityTitle: "Video Editor — Freelance",
    businessName: "Yebo Studios",
    applicantId: "grad_2",
    applicantName: "Kabelo Maseko",
    applicantRole: "graduate",
    coverMessage: "I edit ~6 social pieces a week for two brands — fast turnaround guaranteed.",
    portfolioLink: "https://kabelo.work",
    status: "accepted",
    submittedAt: daysAgo(8),
  },
  {
    id: "app_5",
    opportunityId: "opp_6",
    opportunityTitle: "Matric Maths Tutor (Part-time)",
    businessName: "Finya Edu",
    applicantId: "stu_2",
    applicantName: "Sipho Mahlangu",
    applicantRole: "student",
    coverMessage: "I tutored matric maths in 2024 — distinction at matric myself.",
    status: "rejected",
    submittedAt: daysAgo(11),
  },
];
