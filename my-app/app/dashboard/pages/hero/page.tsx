import { redirect } from "next/navigation";

// Old placeholder screen: its "Publish Changes" button only showed an
// alert() and never touched the database, so edits made here silently
// vanished. The real editor lives under /dashboard/pages/home.
export default function DashboardHeroPage() {
  redirect("/dashboard/pages/home");
}
