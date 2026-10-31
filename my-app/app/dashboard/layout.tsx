import { requireSession } from "@/lib/auth/dal";

import { DashboardLayout } from "../components/dashboard/DashBoardLayout";
import { DashboardProviders } from "./providers";

// ─────────────────────────────────────────────────────────────────────────
//  DASHBOARD LAYOUT — the gate for the whole /dashboard route group.
//
//  `requireSession()` performs the AUTHORITATIVE check on the server: it
//  verifies the session against the backend (JWT signature plus a fresh read
//  of the account from the database) and redirects to /login when the session
//  is missing, expired or revoked. The cookie-presence check in proxy.ts is
//  only an optimistic pre-filter — it never grants access on its own.
//
//  Everything under this layout (including nested routes such as
//  /dashboard/pages/projects) is protected by it.
//
//  NOTE: a layout does not re-render on client-side navigation, so this
//  check runs on every full load of the dashboard. The remaining layers
//  cover the gaps: proxy.ts runs on every navigation (including client-side
//  transitions and prefetches) and every dashboard API call is authorised
//  again by the backend.
// ─────────────────────────────────────────────────────────────────────────

export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireSession();

  return (
    <DashboardProviders>
      <DashboardLayout>{children}</DashboardLayout>
    </DashboardProviders>
  );
}
