"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useCurrentUser } from "./useCurrentUser";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Mail } from "lucide-react";

import {
  dashboardGetMessages,
  dashboardMarkAllRead,
  dashboardMarkLeadRead,
} from "@/lib/services/message.service";
import type { ContactMessage } from "@/lib/types/message";
import type { AppNotification } from "./sidebar-config";
import { useInboxActivity } from "./inboxActivity";

export const MESSAGES_QUERY_KEY = ["messages"] as const;

/**
 * How many of the newest messages the bell dropdown shows. The unread count
 * the server reports is global (all messages), so the window is kept wide
 * enough that recent unread threads are actually visible in the panel.
 */
const NOTIFICATION_LIMIT = 20;

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
  return new Date(iso).toLocaleDateString();
}

function toNotification(message: ContactMessage): AppNotification {
  return {
    id: message.id,
    title: message.name,
    desc: message.subject || message.body.slice(0, 80),
    time: relativeTime(message.createdAt),
    icon: Mail,
    tone: message.status === "unread" ? "indigo" : "emerald",
    // The messages page deep-links on a lead id — a message without one has
    // no thread to open, so it falls back to the inbox itself.
    href: message.leadId
      ? `/dashboard/pages/messages?open=${message.leadId}`
      : "/dashboard/pages/messages",
    unread: message.status === "unread",
  };
}

/**
 * Live contact-inbox notifications for the dashboard top bar.
 *
 * Backed by TanStack Query (polls as a fallback) plus the backend's private
 * inbox stream, reached through the session proxy: the message controller sends
 * a `message` event the instant a submission lands, so the bell updates without
 * a reload.
 */
export function useMessageNotifications() {
  const queryClient = useQueryClient();
  const { activeLeadId } = useInboxActivity();
  const canView = useCurrentUser().can("messages.view");

  const { data, isPending, isError } = useQuery({
    queryKey: [...MESSAGES_QUERY_KEY, "notifications"],
    queryFn: () => dashboardGetMessages({ limit: NOTIFICATION_LIMIT }),
    staleTime: 15_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    enabled: canView,
  });

  // Keep the latest active-thread value readable inside the SSE closure,
  // which is only mounted once.
  const activeLeadRef = useRef(activeLeadId);
  useEffect(() => {
    activeLeadRef.current = activeLeadId;
  }, [activeLeadId]);

  useEffect(() => {
    if (!canView) return;

    const source = new EventSource("/api/backend/events/inbox");

    const refresh = () => {
      queryClient.invalidateQueries({ queryKey: MESSAGES_QUERY_KEY });
      // Keep the inbox list + open thread in sync too, so an unread count the
      // user can see in the UI always matches the server (and the badge).
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead"] });
    };

    const onMessage = (event: MessageEvent) => {
      let payload: {
        name?: string;
        subject?: string;
        leadId?: string;
      } | null = null;
      try {
        payload = JSON.parse(event.data);
      } catch {
        // Malformed frame — the refetch below still surfaces the message.
        refresh();
        return;
      }

      const leadId = payload?.leadId ?? null;
      const onOpenThread =
        leadId !== null && leadId === activeLeadRef.current;

      // The thread this message belongs to is open on screen: clear it on the
      // server *before* refetching, so the bell count never increments for it.
      // If the write fails, the inbox's own mark-read effect retries.
      const markOpenThreadRead =
        onOpenThread && leadId
          ? dashboardMarkLeadRead(leadId).catch(() => {})
          : Promise.resolve();

      void markOpenThreadRead.then(() => {
        refresh();

        if (onOpenThread) return; // auto-read — never notify for it

        toast.success("New contact message", {
          description: payload?.subject
            ? `${payload.name ?? "Someone"} · ${payload.subject}`
            : payload?.name ?? "A visitor sent you a message",
          action: {
            label: "View",
            onClick: () => {
              window.location.href = payload?.leadId
                ? `/dashboard/pages/messages?open=${payload.leadId}`
                : "/dashboard/pages/messages";
            },
          },
        });
      });
    };

    source.addEventListener("message", onMessage);
    source.addEventListener("message:update", refresh);

    return () => {
      source.removeEventListener("message", onMessage);
      source.removeEventListener("message:update", refresh);
      source.close();
    };
  }, [canView, queryClient]);

  const notifications: AppNotification[] = useMemo(
    () => (data?.messages ?? []).map(toNotification),
    [data?.messages],
  );

  const markAllRead = useCallback(async () => {
    try {
      await dashboardMarkAllRead();
      toast.success("All messages marked as read");
      return true;
    } catch {
      toast.error("Could not mark messages as read.");
      return false;
    } finally {
      queryClient.invalidateQueries({ queryKey: MESSAGES_QUERY_KEY });
    }
  }, [queryClient]);

  return {
    // The server count is authoritative: a message on the open thread is
    // marked read immediately (and kept out of this count), while messages
    // from other threads keep incrementing the bell.
    unreadCount: data?.unread ?? 0,
    notifications,
    loading: isPending,
    error: isError,
    markAllRead,
  };
}
