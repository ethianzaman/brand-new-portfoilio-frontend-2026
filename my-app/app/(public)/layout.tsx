import { Footer } from "../components/footer/footer";
import { Navbar } from "../components/navbar/Navbar";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* ✅ Navbar only for public portfolio pages */}
      {/* <main className="pt-16">
        <Navbar />
        {children}
        <Footer />
      </main> */}
      <div className="flex min-h-screen flex-col justify-between">
        <main className="flex-1 pt-16">
          <Navbar />
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
}
