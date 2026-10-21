"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/app/components/dashboard/useCurrentUser";
import { toast } from "sonner";
import {
  ArrowLeft,
  Check,
  CornerUpLeft,
  Inbox,
  Loader2,
  Mail,
  MailOpen,
  MessagesSquare,
  RefreshCw,
  Search,
  Send,
  Star,
  Trash2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  dashboardDeleteLead,
  dashboardDeleteMessage,
  dashboardGetLead,
  dashboardGetLeads,
  dashboardMarkAllRead,
  dashboardMarkLeadRead,
  dashboardReplyToMessage,
  dashboardUpdateMessage,
} from "@/lib/services/message.services";
import type { ContactMessage, LeadSummary } from "@/lib/types/message";
import { useInboxActivity } from "@/app/components/dashboard/inboxActivity";

type Filter = "all" | "unread" | "starred";

type Confirm =
  | { kind: "lead"; id: string; name: string }
  | { kind: "message"; id: string; name: string }
  | null;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "starred", label: "Starred" },
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const seconds = Math.max(0, Math.round((Date.now() - then) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function fullDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function MessagesClient() {
  const { canDelete } = useCurrentUser();
  const queryClient = useQueryClient();
  const { register, setActiveLeadId } = useInboxActivity();

  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileDetail, setMobileDetail] = useState(false);

  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  const [confirm, setConfirm] = useState<Confirm>(null);
  const [deleting, setDeleting] = useState(false);

  // Tracks the newest message id we already cleared per lead, so a fresh
  // message arriving on an open thread always triggers a new mark-read
  // write, while repeated refetches of the same state do not. Keying on the
  // message id (not the unread count) matters: counts repeat — after clearing
  // a thread at count 1, the next single message is count 1 again.
  const markedRef = useRef<Map<string, string>>(new Map());

  // Mark this inbox as "actively viewed" while mounted + tab visible.
  useEffect(() => register(), [register]);

  // Publish which conversation is open on screen, so only that thread's
  // incoming messages get auto-marked as read. On mobile the detail pane is
  // only visible once `mobileDetail` is set; on desktop it is always shown.
  useEffect(() => {
    const isDetailVisible = !selectedId || mobileDetail;
    setActiveLeadId(isDetailVisible ? selectedId : null);
  }, [selectedId, mobileDetail, setActiveLeadId]);

  // Debounce the search box.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Deep link from a notification: /dashboard/pages/messages?open=<leadId>
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("open");
    if (id) {
      setSelectedId(id);
      setMobileDetail(true);
    }
  }, []);

  const leadsQuery = useQuery({
    queryKey: ["leads", { filter, q: debouncedSearch }],
    queryFn: () =>
      dashboardGetLeads({
        status: filter === "unread" ? "unread" : "all",
        starred: filter === "starred",
        q: debouncedSearch,
      }),
    refetchInterval: 30_000,
  });

  const timelineQuery = useQuery({
    queryKey: ["lead", selectedId],
    queryFn: () => dashboardGetLead(selectedId as string),
    enabled: Boolean(selectedId),
  });

  const leads = useMemo(() => leadsQuery.data?.leads ?? [], [leadsQuery.data]);
  const messages = useMemo(
    () => timelineQuery.data?.messages ?? [],
    [timelineQuery.data],
  );

  const selectedLead = useMemo<LeadSummary | null>(() => {
    const fromList = leads.find((l) => l.id === selectedId);
    return fromList ?? timelineQuery.data?.lead ?? null;
  }, [leads, selectedId, timelineQuery.data]);

  const invalidateInbox = useCallback(
    (leadId?: string) => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      queryClient.invalidateQueries({
        queryKey: leadId ? ["lead", leadId] : ["lead"],
      });
    },
    [queryClient],
  );

  const markLeadOpened = useCallback(
    async (id: string, lastMessageId?: string) => {
      // Skip only when this exact message was already cleared for this lead.
      if (lastMessageId && markedRef.current.get(id) === lastMessageId) return;
      if (lastMessageId) markedRef.current.set(id, lastMessageId);
      try {
        await dashboardMarkLeadRead(id);
      } catch {
        if (lastMessageId) markedRef.current.delete(id);
      } finally {
        invalidateInbox(id);
      }
    },
    [invalidateInbox],
  );

  function clearSelection() {
    setSelectedId(null);
    setMobileDetail(false);
    setReplyOpen(false);
    setReplyText("");
  }

  // Opening a person marks the whole thread read.
  function openLead(lead: LeadSummary) {
    setSelectedId(lead.id);
    setMobileDetail(true);
    setReplyOpen(false);
    setReplyText("");
    if (lead.unreadCount > 0) void markLeadOpened(lead.id);
  }

  // Covers deep links where the person isn't in the current (filtered) list,
  // and messages arriving while this thread is on screen: every refetch that
  // still shows unread state here re-marks the open thread read (the id-based
  // dedupe above keeps genuinely new messages flowing through).
  useEffect(() => {
    const data = timelineQuery.data;
    if (!data || selectedId !== data.lead.id) return;
    const last = data.messages[data.messages.length - 1];
    const hasUnread = data.lead.unreadCount > 0 || last?.status === "unread";
    if (!hasUnread) return;
    void markLeadOpened(data.lead.id, last?.id);
  }, [timelineQuery.data, selectedId, markLeadOpened]);

  async function handleMarkAllRead() {
    try {
      await dashboardMarkAllRead();
      toast.success("All messages marked as read");
    } catch {
      toast.error("Could not mark messages as read.");
    } finally {
      invalidateInbox();
    }
  }

  async function toggleStar(message: ContactMessage) {
    try {
      await dashboardUpdateMessage(message.id, { starred: !message.starred });
    } catch {
      toast.error("Could not update the message.");
    } finally {
      invalidateInbox(selectedId ?? undefined);
    }
  }

  async function handleSendReply() {
    const target = messages[messages.length - 1];
    if (!target || !replyText.trim()) return;
    setSending(true);
    try {
      const { delivered, deliveryError } = await dashboardReplyToMessage(
        target.id,
        replyText.trim(),
      );
      setReplyText("");
      setReplyOpen(false);

      if (delivered) {
        toast.success(`Reply sent to ${target.email}`);
      } else {
        toast.warning("Reply saved, but the email was not delivered.", {
          description:
            deliveryError ??
            "Check your mail provider settings (Gmail app password or Resend domain).",
        });
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send the reply.",
      );
    } finally {
      setSending(false);
      invalidateInbox(selectedId ?? undefined);
    }
  }

  async function handleConfirmDelete() {
    if (!confirm) return;
    setDeleting(true);
    try {
      if (confirm.kind === "lead") {
        await dashboardDeleteLead(confirm.id);
        toast.success("Contact deleted");
        if (selectedId === confirm.id) clearSelection();
      } else {
        const wasLast = messages.length <= 1;
        await dashboardDeleteMessage(confirm.id);
        toast.success("Message deleted");
        if (wasLast) clearSelection();
      }
    } catch {
      toast.error("Could not delete.");
    } finally {
      setDeleting(false);
      setConfirm(null);
      invalidateInbox(confirm.kind === "lead" ? undefined : selectedId ?? undefined);
    }
  }

  const unreadCount = leadsQuery.data?.unread ?? 0;
  const latestMessage = messages[messages.length - 1];

  return (
    <>
      <div
        className={cn(
          "grid overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900",
          "h-[calc(100vh-13rem)] min-h-[32rem]",
          "lg:grid-cols-[minmax(0,22rem)_1fr]",
        )}
      >
        {/* ── List pane ── */}
        <div
          className={cn(
            "flex min-h-0 flex-col border-zinc-100 dark:border-zinc-800 lg:border-r",
            mobileDetail ? "hidden lg:flex" : "flex",
          )}
        >
          <div className="flex items-center justify-between gap-2 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Inbox className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-bold text-zinc-900 dark:text-white">
                Inbox
              </span>
              {unreadCount > 0 && (
                <span className="grid min-w-5 place-items-center rounded-full bg-indigo-600 px-1.5 text-[10px] font-bold leading-4 text-white">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => leadsQuery.refetch()}
                aria-label="Refresh"
                className="grid h-7 w-7 place-items-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
              >
                <RefreshCw
                  className={cn(
                    "h-3.5 w-3.5",
                    leadsQuery.isFetching && "animate-spin",
                  )}
                />
              </button>
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={unreadCount === 0}
                className="rounded-lg px-2 py-1 text-[11px] font-semibold text-indigo-600 transition-colors hover:bg-indigo-50 disabled:pointer-events-none disabled:opacity-40 dark:text-indigo-400 dark:hover:bg-indigo-950"
              >
                Mark all read
              </button>
            </div>
          </div>

          {/* Search + filters */}
          <div className="space-y-2 border-b border-zinc-100 px-3 py-3 dark:border-zinc-800">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search people or messages..."
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
            </div>
            <div className="flex gap-1">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    "flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                    filter === f.id
                      ? "bg-indigo-600 text-white"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700",
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            {leadsQuery.isLoading ? (
              <div className="space-y-2 p-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-16 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800"
                  />
                ))}
              </div>
            ) : leadsQuery.isError ? (
              <div className="flex flex-col items-center gap-2 px-4 py-16 text-center">
                <Mail className="h-8 w-8 text-zinc-300 dark:text-zinc-600" />
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Could not load messages.
                </p>
                <button
                  type="button"
                  onClick={() => leadsQuery.refetch()}
                  className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  Try again
                </button>
              </div>
            ) : leads.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-16 text-center">
                <Inbox className="h-8 w-8 text-zinc-300 dark:text-zinc-600" />
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {debouncedSearch
                    ? "No people match your search."
                    : filter === "unread"
                      ? "No unread messages."
                      : filter === "starred"
                        ? "No starred messages."
                        : "Your inbox is empty."}
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {leads.map((lead) => {
                  const active = selectedId === lead.id;
                  const unread = lead.unreadCount > 0;
                  return (
                    <li key={lead.id}>
                      <button
                        type="button"
                        onClick={() => openLead(lead)}
                        className={cn(
                          "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors",
                          active
                            ? "bg-indigo-50/70 dark:bg-indigo-950/40"
                            : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50",
                        )}
                      >
                        <span
                          className={cn(
                            "grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold",
                            unread
                              ? "bg-linear-to-br from-indigo-500 to-purple-600 text-white"
                              : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
                          )}
                        >
                          {initials(lead.name || lead.email)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1.5">
                            <span
                              className={cn(
                                "truncate text-sm",
                                unread
                                  ? "font-bold text-zinc-900 dark:text-white"
                                  : "font-medium text-zinc-700 dark:text-zinc-300",
                              )}
                            >
                              {lead.name || lead.email}
                            </span>
                            {lead.hasStarred && (
                              <Star className="h-3 w-3 shrink-0 fill-amber-400 text-amber-400" />
                            )}
                            {unread && (
                              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                            )}
                            <span className="ml-auto shrink-0 text-[10px] text-zinc-400 dark:text-zinc-500">
                              {relativeTime(lead.lastMessageAt)}
                            </span>
                          </span>
                          <span
                            className={cn(
                              "mt-0.5 block truncate text-xs",
                              unread
                                ? "font-semibold text-zinc-800 dark:text-zinc-200"
                                : "text-zinc-500 dark:text-zinc-400",
                            )}
                          >
                            {lead.preview?.subject || "General Inquiry"}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-zinc-400 dark:text-zinc-500">
                            {lead.preview?.body}
                          </span>
                          {(lead.messageCount > 1 || unread) && (
                            <span className="mt-1.5 flex items-center gap-1.5">
                              {lead.messageCount > 1 && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                                  <MessagesSquare className="h-2.5 w-2.5" />
                                  {lead.messageCount}
                                </span>
                              )}
                              {unread && (
                                <span className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                                  {lead.unreadCount} new
                                </span>
                              )}
                            </span>
                          )}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* ── Detail pane ── */}
        <div
          className={cn(
            "min-h-0 flex-col",
            mobileDetail ? "flex" : "hidden lg:flex",
          )}
        >
          {!selectedLead ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
                <MailOpen className="h-7 w-7 text-zinc-300 dark:text-zinc-600" />
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Select a person to read their messages
              </p>
            </div>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col">
              {/* Detail header */}
              <div className="flex items-start gap-3 border-b border-zinc-100 px-4 py-4 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setMobileDetail(false)}
                  aria-label="Back to list"
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 lg:hidden"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>

                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-linear-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white">
                  {initials(selectedLead.name || selectedLead.email)}
                </span>

                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-sm font-bold text-zinc-900 dark:text-white">
                    {selectedLead.name || selectedLead.email}
                  </h2>
                  <a
                    href={`mailto:${selectedLead.email}`}
                    className="truncate text-xs text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    {selectedLead.email}
                  </a>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <span className="hidden rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 sm:inline">
                    {selectedLead.messageCount}{" "}
                    {selectedLead.messageCount === 1 ? "message" : "messages"}
                  </span>
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() =>
                        setConfirm({
                          kind: "lead",
                          id: selectedLead.id,
                          name: selectedLead.name || selectedLead.email,
                        })
                      }
                      aria-label="Delete contact"
                      title="Delete contact"
                      className="grid h-8 w-8 place-items-center rounded-lg text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
                {timelineQuery.isLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
                  </div>
                ) : messages.length === 0 ? (
                  <p className="py-16 text-center text-sm text-zinc-500 dark:text-zinc-400">
                    No messages found for this person.
                  </p>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className="rounded-2xl border border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/40"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                            {m.subject || "General Inquiry"}
                          </h3>
                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400 dark:text-zinc-500">
                            <span>{fullDate(m.createdAt)}</span>
                            {m.budget && (
                              <span className="rounded-full bg-zinc-100 px-2 py-0.5 font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                                Budget: {m.budget}
                              </span>
                            )}
                            {m.replied && (
                              <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                                Replied
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => toggleStar(m)}
                            aria-label={m.starred ? "Unstar" : "Star"}
                            title={m.starred ? "Unstar" : "Star"}
                            className={cn(
                              "grid h-7 w-7 place-items-center rounded-lg transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800",
                              m.starred
                                ? "text-amber-500"
                                : "text-zinc-400 hover:text-amber-500",
                            )}
                          >
                            <Star
                              className={cn(
                                "h-3.5 w-3.5",
                                m.starred && "fill-amber-400 text-amber-400",
                              )}
                            />
                          </button>
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() =>
                                setConfirm({
                                  kind: "message",
                                  id: m.id,
                                  name: selectedLead.name || selectedLead.email,
                                })
                              }
                              aria-label="Delete message"
                              title="Delete message"
                              className="grid h-7 w-7 place-items-center rounded-lg text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                        {m.body}
                      </p>

                      {m.replies.length > 0 && (
                        <div className="mt-4 space-y-2.5 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                          {m.replies.map((r) => (
                            <div
                              key={r.id}
                              className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 dark:border-indigo-900/60 dark:bg-indigo-950/30"
                            >
                              <div className="mb-1 flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                                <CornerUpLeft className="h-3 w-3" />
                                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                  You
                                </span>
                                <span>·</span>
                                <span>{fullDate(r.sentAt)}</span>
                              </div>
                              <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-200">
                                {r.body}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Reply composer */}
              {latestMessage && (
                <div className="border-t border-zinc-100 p-4 dark:border-zinc-800">
                  {replyOpen ? (
                    <div className="space-y-2">
                      <textarea
                        autoFocus
                        rows={4}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={`Reply to ${selectedLead.name || selectedLead.email}...`}
                        className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                      />
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                          Attaches to the latest message.
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setReplyOpen(false);
                              setReplyText("");
                            }}
                            className="rounded-xl px-3.5 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleSendReply}
                            disabled={sending || !replyText.trim()}
                            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
                          >
                            {sending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                            Send reply
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setReplyOpen(true)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-indigo-700 dark:hover:text-indigo-400"
                    >
                      <CornerUpLeft className="h-4 w-4" />
                      Reply to{" "}
                      {(selectedLead.name || selectedLead.email).split(" ")[0]}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Delete confirmation ── */}
      {confirm && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-red-50 dark:bg-red-950/50">
              <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              {confirm.kind === "lead" ? "Delete contact?" : "Delete message?"}
            </h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {confirm.kind === "lead" ? (
                <>
                  This permanently deletes every message from{" "}
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                    {confirm.name}
                  </span>
                  . This cannot be undone.
                </>
              ) : (
                <>
                  This permanently deletes the message from{" "}
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                    {confirm.name}
                  </span>
                  . This cannot be undone.
                </>
              )}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirm(null)}
                disabled={deleting}
                className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
