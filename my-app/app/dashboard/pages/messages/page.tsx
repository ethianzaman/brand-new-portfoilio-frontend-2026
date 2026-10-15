import { Suspense } from "react";
import { Inbox } from "lucide-react";
import { MessagesClient } from "./MessagesClient";

export const metadata = {
  title: "Messages — Dashboard",
};

export default function DashboardMessagesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950
                        flex items-center justify-center"
        >
          <Inbox className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
            Messages
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Read, reply to and manage contact inquiries
          </p>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="h-[60vh] rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900" />
        }
      >
        <MessagesClient />
      </Suspense>
    </div>
  );
}
