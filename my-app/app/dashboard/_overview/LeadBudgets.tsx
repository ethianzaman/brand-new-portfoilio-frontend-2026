"use client";

import { Wallet } from "lucide-react";

import type { Section } from "@/lib/services/dashboard-home.service";
import type { InboxStats } from "@/lib/types/message";
import { BreakdownCard } from "./Breakdown";
import { useInboxStats } from "./useInboxStats";

export function LeadBudgets({ inbox }: { inbox: Section<InboxStats> }) {
  const { stats } = useInboxStats(inbox);

  return (
    <BreakdownCard
      icon={Wallet}
      title="Budget of enquiries"
      subtitle="As chosen on the contact form"
      rows={stats ? stats.budgets : null}
      empty="No messages yet"
    />
  );
}
