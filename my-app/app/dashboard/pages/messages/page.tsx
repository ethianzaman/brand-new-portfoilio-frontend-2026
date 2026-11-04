import { Suspense } from "react";
import { Inbox } from "lucide-react";
import { PageHeader } from "@/app/components/dashboard/PageHeader";
import { MessagesClient } from "./MessagesClient";

export const metadata = {
  title: "Messages — Dashboard",
};

export default function DashboardMessagesPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon={Inbox}
        title="Messages"
        description="Read, reply to and manage contact inquiries"
      />

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
