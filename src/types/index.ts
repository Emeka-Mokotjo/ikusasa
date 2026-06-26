export type UserRole = "student" | "graduate" | "business" | "admin";

export type ApplicationStatus =
  | "submitted"
  | "shortlisted"
  | "interview"
  | "accepted"
  | "rejected"
  | "withdrawn";

export type OpportunityType =
  | "freelance"
  | "internship"
  | "part-time"
  | "entry-level"
  | "short-project";

export type CompensationType = "fixed" | "hourly" | "stipend" | "unpaid";

export type OpportunityStatus = "draft" | "open" | "closed" | "filled";

export interface BaseUser {
  id: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  fullName: string;
  createdAt: string;
  onboardingComplete: boolean;
}

export interface Student extends BaseUser {
  role: "student";
  university: string;
  degree: string;
  graduationYear: number;
  skills: string[];
  portfolio: PortfolioLinks;
  cvFileName?: string;
  city?: string;
}

export interface Graduate extends BaseUser {
  role: "graduate";
  university: string;
  degree: string;
  graduationYear: number;
  yearsSinceGraduation: number;
  currentRole?: string;
  skills: string[];
  portfolio: PortfolioLinks;
  cvFileName?: string;
  city?: string;
}

export interface Business extends BaseUser {
  role: "business";
  companyName: string;
  industry: string;
  website?: string;
  description: string;
  registrationNumber?: string;
  verified: boolean;
  logoUrl?: string;
  city?: string;
  documents?: string[];
}

export interface AdminUser extends BaseUser {
  role: "admin";
}

export type User = Student | Graduate | Business | AdminUser;

export interface PortfolioLinks {
  linkedin?: string;
  github?: string;
  website?: string;
}

export interface Opportunity {
  id: string;
  businessId: string;
  businessName: string;
  businessLogoUrl?: string;
  title: string;
  type: OpportunityType;
  description: string;
  requirements: string[];
  skills: string[];
  location: string;
  remote: boolean;
  compensationType: CompensationType;
  compensationAmount: number;
  durationWeeks: number;
  postedAt: string;
  deadline: string;
  status: OpportunityStatus;
  applicantCount: number;
}

export interface Application {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  businessName: string;
  applicantId: string;
  applicantName: string;
  applicantRole: UserRole;
  coverMessage: string;
  portfolioLink?: string;
  cvFileName?: string;
  status: ApplicationStatus;
  submittedAt: string;
}

export interface Review {
  id: string;
  subjectId: string;
  subjectType: "student" | "graduate" | "business";
  authorId: string;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
  opportunityTitle?: string;
}

export type NotificationKind =
  | "application_update"
  | "new_applicant"
  | "review_received"
  | "opportunity_match"
  | "system";

export interface AppNotification {
  id: string;
  userId: string;
  kind: NotificationKind;
  title: string;
  body: string;
  href?: string;
  createdAt: string;
  read: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  body: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  participantNames: string[];
  participantRoles: UserRole[];
  opportunityTitle?: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export type WalletTxnType = "earning" | "withdrawal" | "payout" | "fee" | "charge";
export type WalletTxnStatus = "pending" | "completed" | "failed";

export interface WalletTransaction {
  id: string;
  userId: string;
  type: WalletTxnType;
  status: WalletTxnStatus;
  amount: number;
  description: string;
  counterpartyName?: string;
  opportunityTitle?: string;
  createdAt: string;
}

export interface WalletSummary {
  available: number;
  pending: number;
  lifetimeEarnings: number;
  lastPayoutAt?: string;
}

export interface AdminStats {
  totalUsers: number;
  totalStudents: number;
  totalGraduates: number;
  totalBusinesses: number;
  totalOpportunities: number;
  openOpportunities: number;
  totalApplications: number;
  pendingVerifications: number;
  flaggedItems: number;
  signupsLast7Days: number[];
}

export type DisputeStatus = "open" | "in_review" | "resolved" | "rejected";

export interface Dispute {
  id: string;
  opportunityTitle: string;
  raisedByName: string;
  raisedByRole: UserRole;
  againstName: string;
  reason: string;
  amount?: number;
  status: DisputeStatus;
  createdAt: string;
}

export interface Placement {
  id: string;
  applicantName: string;
  applicantRole: UserRole;
  businessName: string;
  opportunityTitle: string;
  startedAt: string;
  compensationAmount: number;
  status: "active" | "completed";
}
