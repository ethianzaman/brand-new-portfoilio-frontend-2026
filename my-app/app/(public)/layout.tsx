import { Footer } from "../components/footer/footer";
import { Navbar } from "../components/navbar/Navbar";
import { LiveRefresh } from "@/components/LiveRefresh";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* ✅ Navbar only for public portfolio pages */}
      <div className="flex min-h-screen flex-col justify-between">
        <main className="flex-1 pt-16">
          <Navbar />
          {children}
        </main>
        <Footer />
      </div>

      {/* Server-Sent Events → router.refresh() on dashboard edits.
          Public layout ONLY — never mount this in the dashboard. */}
      <LiveRefresh />
    </>
  );
}
