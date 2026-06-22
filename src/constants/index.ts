import type { OpportunityType, ApplicationStatus, UserRole } from "@/types";

export const APP_NAME = "Ikusasa";
export const APP_TAGLINE = "Where emerging talent gets to work";
export const CURRENCY = "ZAR";

export const ROLE_LABEL: Record<UserRole, string> = {
  student: "Student",
  graduate: "Recent graduate",
  business: "Business",
  admin: "Admin",
};

export const OPPORTUNITY_TYPE_LABEL: Record<OpportunityType, string> = {
  freelance: "Freelance",
  internship: "Internship",
  "part-time": "Part-time",
  "entry-level": "Entry-level",
  "short-project": "Short project",
};

export const APPLICATION_STATUS_LABEL: Record<ApplicationStatus, string> = {
  submitted: "Submitted",
  shortlisted: "Shortlisted",
  interview: "Interview",
  accepted: "Accepted",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

export const SA_CITIES = [
  "Johannesburg",
  "Cape Town",
  "Durban",
  "Pretoria",
  "Port Elizabeth",
  "Bloemfontein",
  "Stellenbosch",
  "East London",
  "Polokwane",
  "Remote",
];

export const SA_UNIVERSITIES = [
  "University of Cape Town",
  "University of the Witwatersrand",
  "Stellenbosch University",
  "University of Pretoria",
  "University of KwaZulu-Natal",
  "Rhodes University",
  "University of Johannesburg",
  "Nelson Mandela University",
  "North-West University",
  "University of the Western Cape",
];

export const INDUSTRIES = [
  "Technology",
  "Finance",
  "Media & Marketing",
  "Design",
  "Education",
  "Healthcare",
  "Retail & E-commerce",
  "Manufacturing",
  "Non-profit",
  "Hospitality",
  "Logistics",
  "Energy",
];

export const SKILLS_CATALOG = [
  "React",
  "TypeScript",
  "Node.js",
  "Python",
  "Figma",
  "UI/UX Design",
  "Graphic Design",
  "Copywriting",
  "Content Strategy",
  "SEO",
  "Social Media",
  "Data Analysis",
  "Excel",
  "SQL",
  "Marketing",
  "Sales",
  "Customer Support",
  "Project Management",
  "Video Editing",
  "Photography",
  "Translation",
  "Tutoring",
  "Bookkeeping",
  "Research",
];
