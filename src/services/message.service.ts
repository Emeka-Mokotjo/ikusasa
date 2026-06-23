import { delay } from "./_delay";
import { mockConversations, mockMessages } from "@/mock-data/messages";
import type { Conversation, Message } from "@/types";

export const messageService = {
  async listConversations(userId: string): Promise<Conversation[]> {
    // For demo, every user sees seeded conversations relevant to them (fallback to stu_1's set).
    const mine = mockConversations.filter((c) => c.participantIds.includes(userId));
    return delay(mine.length ? mine : mockConversations);
  },
  async getConversation(id: string): Promise<Conversation | undefined> {
    return delay(mockConversations.find((c) => c.id === id));
  },
  async listMessages(conversationId: string): Promise<Message[]> {
    return delay(
      mockMessages
        .filter((m) => m.conversationId === conversationId)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    );
  },
  async sendMessage(input: {
    conversationId: string;
    senderId: string;
    senderName: string;
    body: string;
  }): Promise<Message> {
    const msg: Message = {
      id: `m_${Date.now()}`,
      conversationId: input.conversationId,
      senderId: input.senderId,
      senderName: input.senderName,
      body: input.body,
      createdAt: new Date().toISOString(),
      read: true,
    };
    mockMessages.push(msg);
    const convo = mockConversations.find((c) => c.id === input.conversationId);
    if (convo) {
      convo.lastMessage = input.body;
      convo.lastMessageAt = msg.createdAt;
    }
    return delay(msg, 200);
  },
  async markConversationRead(conversationId: string): Promise<void> {
    const convo = mockConversations.find((c) => c.id === conversationId);
    if (convo) convo.unreadCount = 0;
    mockMessages.forEach((m) => {
      if (m.conversationId === conversationId) m.read = true;
    });
    return delay(undefined, 100);
  },
};
