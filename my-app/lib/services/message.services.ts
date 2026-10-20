import { dashboardApiUrl } from "@/lib/api/config";
import type {
  ContactMessage,
  LeadListParams,
  LeadListResponse,
  LeadSummary,
  LeadTimeline,
  MessageListParams,
  MessageListResponse,
  MessageUpdateInput,
  NewMessageInput,
} from "@/lib/types/message";

// ─────────────────────────────────────────────────────────────────────────
//  MESSAGE API — contact inbox (public submit + dashboard management).
//
//  Backend endpoints (Backend/src/routes/message.routes.ts):
//    POST   {API}/messages             → public submission
//    GET    {API}/messages             → list (+ total, unread)
//    GET    {API}/messages/unread-count
//    PATCH  {API}/messages/:id         → read/unread, star
//    POST   {API}/messages/:id/reply   → dispatch via Resend
//    POST   {API}/messages/read-all
//    DELETE {API}/messages/:id
// ─────────────────────────────────────────────────────────────────────────

/**
 * Resolve the backend base per call: the server-only `API_URL` on the server
 * (e.g. the /api/contact proxy, dashboard server renders) and the
 * same-origin `/api/backend` proxy in the browser (interactive dashboard
 * components), which attaches the backend JWT from the session cookie.
 */
function messagesUrl(): string {
  return `${dashboardApiUrl()}/messages`;
}

//  LEAD API (Backend/src/routes/lead.routes.ts):
//    GET    {API}/leads           → grouped contacts (+ preview, unread)
//    GET    {API}/leads/:id       → a person's full message timeline
//    POST   {API}/leads/:id/read  → mark every message from a person read
//    DELETE {API}/leads/:id       → remove a person and all their messages
function leadsUrl(): string {
  return `${dashboardApiUrl()}/leads`;
}

async function getErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  const error = await response.json().catch(() => null);
  return error?.message ?? fallback;
}

// ── Public — submit ────────────────────────────────────────────────
export async function submitContactMessage(
  input: NewMessageInput,
): Promise<ContactMessage> {
  const response = await fetch(messagesUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Unable to send your message."),
    );
  }

  const json = await response.json();
  return json.message as ContactMessage;
}

// ── Dashboard — list ───────────────────────────────────────────────
export async function dashboardGetMessages(
  params: MessageListParams = {},
): Promise<MessageListResponse> {
  const query = new URLSearchParams();

  if (params.status && params.status !== "all") {
    query.set("status", params.status);
  }
  if (params.starred) query.set("starred", "true");
  if (params.q?.trim()) query.set("q", params.q.trim());
  if (params.limit) query.set("limit", String(params.limit));

  const url = query.size ? `${messagesUrl()}?${query.toString()}` : messagesUrl();

  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Failed to load messages."),
    );
  }

  const json = await response.json();

  return {
    messages: (json.messages ?? []) as ContactMessage[],
    total: Number(json.total ?? 0),
    unread: Number(json.unread ?? 0),
  };
}

// ── Dashboard — unread badge ───────────────────────────────────────
export async function dashboardGetUnreadCount(): Promise<number> {
  const response = await fetch(`${messagesUrl()}/unread-count`, {
    cache: "no-store",
  });

  if (!response.ok) return 0;

  const json = await response.json().catch(() => ({}));
  return Number(json.unread ?? 0);
}

// ── Dashboard — single ─────────────────────────────────────────────
export async function dashboardGetMessage(
  id: string,
): Promise<ContactMessage> {
  const response = await fetch(`${messagesUrl()}/${id}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Failed to load the message."),
    );
  }

  const json = await response.json();
  return json.message as ContactMessage;
}

// ── Dashboard — read/unread + star ─────────────────────────────────
export async function dashboardUpdateMessage(
  id: string,
  patch: MessageUpdateInput,
): Promise<ContactMessage> {
  const response = await fetch(`${messagesUrl()}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Failed to update the message."),
    );
  }

  const json = await response.json();
  return json.message as ContactMessage;
}

// ── Dashboard — mark all read ──────────────────────────────────────
export async function dashboardMarkAllRead(): Promise<number> {
  const response = await fetch(`${messagesUrl()}/read-all`, {
    method: "POST",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Failed to mark messages as read."),
    );
  }

  const json = await response.json().catch(() => ({}));
  return Number(json.modified ?? 0);
}

// ── Dashboard — reply (Resend) ─────────────────────────────────────
export async function dashboardReplyToMessage(
  id: string,
  body: string,
): Promise<{
  message: ContactMessage;
  delivered: boolean;
  deliveryError?: string;
}> {
  const response = await fetch(`${messagesUrl()}/${id}/reply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Failed to send the reply."),
    );
  }

  const json = await response.json();
  return {
    message: json.message as ContactMessage,
    delivered: Boolean(json.delivered),
    deliveryError:
      typeof json.deliveryError === "string" ? json.deliveryError : undefined,
  };
}

// ── Dashboard — delete ─────────────────────────────────────────────
export async function dashboardDeleteMessage(id: string): Promise<boolean> {
  const response = await fetch(`${messagesUrl()}/${id}`, {
    method: "DELETE",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Failed to delete the message."),
    );
  }

  return true;
}

// ── Dashboard — grouped contacts (leads) ───────────────────────────
export async function dashboardGetLeads(
  params: LeadListParams = {},
): Promise<LeadListResponse> {
  const query = new URLSearchParams();

  if (params.status && params.status !== "all") {
    query.set("status", params.status);
  }
  if (params.starred) query.set("starred", "true");
  if (params.q?.trim()) query.set("q", params.q.trim());
  if (params.limit) query.set("limit", String(params.limit));

  const url = query.size ? `${leadsUrl()}?${query.toString()}` : leadsUrl();

  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Failed to load contacts."),
    );
  }

  const json = await response.json();

  return {
    leads: (json.leads ?? []) as LeadSummary[],
    total: Number(json.total ?? 0),
    unread: Number(json.unread ?? 0),
  };
}

// ── Dashboard — one contact's timeline ─────────────────────────────
export async function dashboardGetLead(id: string): Promise<LeadTimeline> {
  const response = await fetch(`${leadsUrl()}/${id}`, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Failed to load the contact."),
    );
  }

  const json = await response.json();
  return {
    lead: json.lead as LeadSummary,
    messages: (json.messages ?? []) as ContactMessage[],
  };
}

// ── Dashboard — mark a whole contact read ──────────────────────────
export async function dashboardMarkLeadRead(id: string): Promise<LeadSummary> {
  const response = await fetch(`${leadsUrl()}/${id}/read`, {
    method: "POST",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Failed to mark the contact as read."),
    );
  }

  const json = await response.json();
  return json.lead as LeadSummary;
}

// ── Dashboard — delete a whole contact ─────────────────────────────
export async function dashboardDeleteLead(id: string): Promise<boolean> {
  const response = await fetch(`${leadsUrl()}/${id}`, {
    method: "DELETE",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Failed to delete the contact."),
    );
  }

  return true;
}
