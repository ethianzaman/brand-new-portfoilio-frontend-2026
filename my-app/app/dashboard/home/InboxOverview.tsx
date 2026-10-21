import { Inbox, ArrowRight, Mail, MailOpen } from "lucide-react";
import { SectionCard } from "./SectionCard";
import type { ContactMessage } from "@/lib/types/message";

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

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

type Props = {
  messages: ContactMessage[];
  total: number;
  unread: number;
};

export function InboxOverview({ messages, total, unread }: Props) {
  const recent = messages.slice(0, 5);

  const miniStats = [
    {
      key: "total",
      label: "Total messages",
      value: total,
      icon: Mail,
      tile: "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400",
    },
    {
      key: "unread",
      label: unread > 0 ? "Awaiting reply" : "Inbox zero",
      value: unread,
      icon: MailOpen,
      tile:
        unread > 0
          ? "bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400"
          : "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400",
    },
  ];

  return (
    <SectionCard
      icon={Inbox}
      title="Inbox Overview"
      subtitle="Latest contact messages"
      right={
        <a
          href="/dashboard/pages/messages"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
        >
          View inbox <ArrowRight className="w-3 h-3" />
        </a>
      }
    >
      {total === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
            No messages yet
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
            Visitor messages from your contact form will appear here
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Mini stats */}
          <div className="grid grid-cols-2 gap-2">
            {miniStats.map(({ key, label, value, icon: Icon, tile }) => (
              <div
                key={key}
                className="flex items-center gap-2.5 rounded-xl border border-zinc-200/70 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 p-2.5"
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${tile}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold text-zinc-900 dark:text-white leading-none tabular-nums">
                    {value}
                  </p>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 truncate">
                    {label}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Recent messages */}
          <div className="flex flex-col gap-1.5">
            {recent.map((m) => {
              const isUnread = m.status === "unread";
              return (
                <a
                  key={m.id}
                  href={`/dashboard/pages/messages?open=${m.leadId ?? m.id}`}
                  className="flex items-center gap-2.5 rounded-xl border border-zinc-200/70 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 px-2.5 py-2 transition-colors hover:border-indigo-200 dark:hover:border-indigo-800/60"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[11px] font-semibold ${
                      isUnread
                        ? "bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400"
                        : "bg-zinc-200/80 dark:bg-zinc-700/60 text-zinc-500 dark:text-zinc-400"
                    }`}
                  >
                    {initials(m.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-xs truncate ${
                          isUnread
                            ? "font-semibold text-zinc-900 dark:text-white"
                            : "font-medium text-zinc-700 dark:text-zinc-300"
                        }`}
                      >
                        {m.name}
                      </p>
                      <span className="ml-auto shrink-0 text-[10px] text-zinc-400 dark:text-zinc-500">
                        {relativeTime(m.createdAt)}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                      {m.subject || m.body}
                    </p>
                  </div>
                  {isUnread && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                  )}
                </a>
              );
            })}
          </div>
        </div>
      )}
    </SectionCard>
  );
}
