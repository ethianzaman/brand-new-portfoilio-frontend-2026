export type MessageStatus = "unread" | "read";

export interface MessageReply {
  id: string;
  body: string;
  sentAt: string;
}

export interface ContactMessage {
  id: string;
  leadId: string | null;
  name: string;
  email: string;
  subject: string;
  budget: string;
  body: string;
  status: MessageStatus;
  starred: boolean;
  replied: boolean;
  replies: MessageReply[];
  createdAt: string;
  updatedAt: string;
}

export interface LeadPreview {
  subject: string;
  body: string;
  status: MessageStatus;
  starred: boolean;
  at: string;
}

export interface LeadSummary {
  id: string;
  name: string;
  email: string;
  firstSeenAt: string;
  lastSeenAt: string;
  lastMessageAt: string;
  messageCount: number;
  unreadCount: number;
  replyCount: number;
  hasStarred?: boolean;
  preview?: LeadPreview | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeadListResponse {
  leads: LeadSummary[];
  total: number;
  unread: number;
}

export interface LeadListParams {
  status?: MessageStatus | "all";
  starred?: boolean;
  q?: string;
  limit?: number;
}

export interface LeadTimeline {
  lead: LeadSummary;
  messages: ContactMessage[];
}

export interface MessageListResponse {
  messages: ContactMessage[];
  total: number;
  unread: number;
}

export interface MessageListParams {
  status?: MessageStatus | "all";
  starred?: boolean;
  q?: string;
  limit?: number;
}

export interface NewMessageInput {
  name: string;
  email: string;
  subject?: string;
  budget?: string;
  message: string;
  idempotencyKey?: string;
}

export interface MessageUpdateInput {
  status?: MessageStatus;
  starred?: boolean;
}
