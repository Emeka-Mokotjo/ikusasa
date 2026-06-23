import type { Conversation, Message } from "@/types";

const now = Date.now();
const mins = (m: number) => new Date(now - m * 60000).toISOString();

export const mockConversations: Conversation[] = [
  {
    id: "conv_1",
    participantIds: ["stu_1", "biz_1"],
    participantNames: ["Amahle Ndlovu", "Kwelo Ventures"],
    participantRoles: ["student", "business"],
    opportunityTitle: "Frontend Engineer (Internship)",
    lastMessage: "Great, let's schedule a call on Thursday at 14:00.",
    lastMessageAt: mins(20),
    unreadCount: 2,
  },
  {
    id: "conv_2",
    participantIds: ["stu_1", "biz_2"],
    participantNames: ["Amahle Ndlovu", "Brightline Studio"],
    participantRoles: ["student", "business"],
    opportunityTitle: "UI Design Sprint",
    lastMessage: "Thanks for the portfolio — really strong work.",
    lastMessageAt: mins(60 * 6),
    unreadCount: 0,
  },
  {
    id: "conv_3",
    participantIds: ["grad_1", "biz_1"],
    participantNames: ["Nomsa Khumalo", "Kwelo Ventures"],
    participantRoles: ["graduate", "business"],
    opportunityTitle: "SQL & Data Analyst",
    lastMessage: "Can you share a sample dashboard from a past project?",
    lastMessageAt: mins(60 * 24),
    unreadCount: 1,
  },
];

export const mockMessages: Message[] = [
  {
    id: "m_1",
    conversationId: "conv_1",
    senderId: "biz_1",
    senderName: "Kwelo Ventures",
    body: "Hi Amahle — loved your application. Are you free this week for a quick intro?",
    createdAt: mins(120),
    read: true,
  },
  {
    id: "m_2",
    conversationId: "conv_1",
    senderId: "stu_1",
    senderName: "Amahle Ndlovu",
    body: "Hi! Yes, Thursday or Friday works for me.",
    createdAt: mins(90),
    read: true,
  },
  {
    id: "m_3",
    conversationId: "conv_1",
    senderId: "biz_1",
    senderName: "Kwelo Ventures",
    body: "Great, let's schedule a call on Thursday at 14:00.",
    createdAt: mins(20),
    read: false,
  },
  {
    id: "m_4",
    conversationId: "conv_2",
    senderId: "biz_2",
    senderName: "Brightline Studio",
    body: "Thanks for the portfolio — really strong work.",
    createdAt: mins(60 * 6),
    read: true,
  },
  {
    id: "m_5",
    conversationId: "conv_3",
    senderId: "biz_1",
    senderName: "Kwelo Ventures",
    body: "Can you share a sample dashboard from a past project?",
    createdAt: mins(60 * 24),
    read: false,
  },
];
