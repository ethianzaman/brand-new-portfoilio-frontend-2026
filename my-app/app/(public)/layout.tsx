import { Footer } from "../components/footer/footer";
import { Navbar } from "../components/navbar/Navbar";
import { LiveRefresh } from "@/components/LiveRefresh";
import { getSiteSettings } from "@/lib/api/settings";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // One shared read feeds both the Navbar and the Footer, so they can never
  // show a different brand. Cached under the `settings` tag and refreshed on
  // demand by the backend's `publishChange("settings")`.
  const settings = await getSiteSettings();

  return (
    <>
      {/* ✅ Navbar only for public portfolio pages */}
      <div className="flex min-h-screen flex-col justify-between">
        <main className="flex-1 pt-16">
          <Navbar settings={settings} />
          {children}
        </main>
        <Footer settings={settings} />
      </div>

      {/* Server-Sent Events → router.refresh() on dashboard edits.
          Public layout ONLY — never mount this in the dashboard. */}
      <LiveRefresh />
    </>
  );
}
