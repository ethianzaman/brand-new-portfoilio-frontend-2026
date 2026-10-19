"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Mail } from "lucide-react";

import { publicApiUrl } from "@/lib/api/config";
import {
  dashboardGetMessages,
  dashboardMarkAllRead,
} from "@/lib/services/message.services";
import type { ContactMessage } from "@/lib/types/message";
import type { AppNotification } from "./sidebar-config";

export const MESSAGES_QUERY_KEY = ["messages"] as const;

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
    href: `/dashboard/pages/messages?open=${message.leadId ?? message.id}`,
    unread: message.status === "unread",
  };
}

/**
 * Live contact-inbox notifications for the dashboard top bar.
 *
 * Backed by TanStack Query (polls as a fallback) plus the backend SSE stream:
 * the message controller broadcasts a `message` event the instant a submission
 * lands, so the bell updates without a reload.
 */
export function useMessageNotifications() {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: [...MESSAGES_QUERY_KEY, "notifications"],
    queryFn: () => dashboardGetMessages({ limit: 8 }),
    staleTime: 15_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    const source = new EventSource(`${publicApiUrl()}/events`);

    const refresh = () =>
      queryClient.invalidateQueries({ queryKey: MESSAGES_QUERY_KEY });

    const onMessage = (event: MessageEvent) => {
      refresh();
      try {
        const data = JSON.parse(event.data) as {
          name?: string;
          subject?: string;
          leadId?: string;
        };
        toast.success("New contact message", {
          description: data?.subject
            ? `${data.name ?? "Someone"} · ${data.subject}`
            : data?.name ?? "A visitor sent you a message",
          action: {
            label: "View",
            onClick: () => {
              window.location.href = data?.leadId
                ? `/dashboard/pages/messages?open=${data.leadId}`
                : "/dashboard/pages/messages";
            },
          },
        });
      } catch {
        // Malformed frame — the refetch above still surfaces the message.
      }
    };

    source.addEventListener("message", onMessage);
    source.addEventListener("message:update", refresh);

    return () => {
      source.removeEventListener("message", onMessage);
      source.removeEventListener("message:update", refresh);
      source.close();
    };
  }, [queryClient]);

  const notifications: AppNotification[] = (data?.messages ?? []).map(
    toNotification,
  );

  const markAllRead = async () => {
    try {
      await dashboardMarkAllRead();
    } finally {
      queryClient.invalidateQueries({ queryKey: MESSAGES_QUERY_KEY });
    }
  };

  return {
    unreadCount: data?.unread ?? 0,
    notifications,
    loading: !data,
    markAllRead,
  };
}
