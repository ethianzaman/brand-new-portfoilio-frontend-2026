"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/app/components/dashboard/useCurrentUser";
import { ConfirmDeleteModal, DeleteTarget } from "@/app/components/dashboard/ConfirmDeleteModal";
import { toast } from "sonner";
import { Loader2, MailOpen } from "lucide-react";

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
} from "@/lib/services/message.service";
import type { ContactMessage, LeadSummary } from "@/lib/types/message";
import { useInboxActivity } from "@/app/components/dashboard/inboxActivity";
import { LeadList, type Filter } from "./LeadList";
import { MessageCard } from "./MessageCard";
import { ReplyComposer } from "./ReplyComposer";
import { ThreadHeader } from "./ThreadHeader";

type Confirm =
  | { kind: "lead"; id: string; name: string }
  | { kind: "message"; id: string; name: string }
  | null;

export function MessagesClient() {
  const { can } = useCurrentUser();
  const canDelete = can("messages.delete");
  const canEdit = can("messages.edit");
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
      // The URL is only readable in the browser, so this cannot be initial state
      // without the server and client rendering different lists.
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
      // Without edit rights the thread stays unread for whoever can clear it.
      if (!canEdit) return;
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
    [canEdit, invalidateInbox],
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
      setConfirm(null);
      invalidateInbox(confirm.kind === "lead" ? undefined : selectedId ?? undefined);
    }
  }

  const unreadCount = leadsQuery.data?.unread ?? 0;
  const latestMessage = messages[messages.length - 1];
  const selectedName = selectedLead ? selectedLead.name || selectedLead.email : "";

  return (
    <>
      <div
        className={cn(
          "grid overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900",
          "h-[calc(100vh-13rem)] min-h-128",
          "lg:grid-cols-[minmax(0,22rem)_1fr]",
        )}
      >
        <div
          className={cn(
            "flex min-h-0 flex-col border-zinc-100 dark:border-zinc-800 lg:border-r",
            mobileDetail ? "hidden lg:flex" : "flex",
          )}
        >
          <LeadList
            leads={leads}
            selectedId={selectedId}
            unreadCount={unreadCount}
            canEdit={canEdit}
            isLoading={leadsQuery.isLoading}
            isError={leadsQuery.isError}
            isFetching={leadsQuery.isFetching}
            search={search}
            activeSearch={debouncedSearch}
            filter={filter}
            onSearch={setSearch}
            onFilter={setFilter}
            onOpen={openLead}
            onRefresh={() => leadsQuery.refetch()}
            onMarkAllRead={handleMarkAllRead}
          />
        </div>

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
              <ThreadHeader
                lead={selectedLead}
                canDelete={canDelete}
                onBack={() => setMobileDetail(false)}
                onDelete={() =>
                  setConfirm({ kind: "lead", id: selectedLead.id, name: selectedName })
                }
              />

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
                    <MessageCard
                      key={m.id}
                      message={m}
                      canEdit={canEdit}
                      canDelete={canDelete}
                      onToggleStar={() => toggleStar(m)}
                      onDelete={() => setConfirm({ kind: "message", id: m.id, name: selectedName })}
                    />
                  ))
                )}
              </div>

              {latestMessage && canEdit && (
                <ReplyComposer
                  name={selectedName}
                  open={replyOpen}
                  text={replyText}
                  sending={sending}
                  onOpen={() => setReplyOpen(true)}
                  onClose={() => {
                    setReplyOpen(false);
                    setReplyText("");
                  }}
                  onChange={setReplyText}
                  onSend={handleSendReply}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {confirm && (
        <ConfirmDeleteModal
          title={confirm.kind === "lead" ? "Delete contact?" : "Delete message?"}
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirm(null)}
        >
          This permanently deletes {confirm.kind === "lead" ? "every message" : "the message"} from{" "}
          <DeleteTarget>{confirm.name}</DeleteTarget>. This cannot be undone.
        </ConfirmDeleteModal>
      )}
    </>
  );
}
