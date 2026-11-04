import { Footer } from "../components/footer/footer";
import { Navbar } from "../components/navbar/Navbar";
import { SiteBackground } from "@/app/components/background/SiteBackground";
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
      <div className="relative isolate flex min-h-screen flex-col justify-between">
        {/* One shared background for every public page. Defined once here
            instead of being repeated in each hero/section. */}
        <SiteBackground />

        <main className="relative flex-1 pt-16">
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
