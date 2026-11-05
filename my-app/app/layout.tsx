import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";
import { Providers } from "./providers";
import { JsonLd } from "./components/seo/JsonLd";
import { personJsonLd, websiteJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { getAbout } from "@/lib/api/about";
import { getSiteSettings } from "@/lib/api/settings";
import "./globals.css";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

/**
 * Site-wide metadata baseline.
 *
 * Resolved from the dashboard-managed global SEO defaults (`GET /settings`
 * → `seo`). A missing/unreachable backend degrades to the neutral settings
 * object, so the app still boots with a minimal `<title>` instead of failing
 * the build.
 *
 * Page-level `generateMetadata` overrides these per route; `title.template`
 * applies the global title template to child pages that set a plain `title`.
 */
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return buildMetadata({
    path: "/",
    title: settings.brand.name || settings.seo?.defaultMetaTitle || "",
    description: settings.brand.tagline || undefined,
    siteSeo: settings.seo,
  });
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Site-wide Person + WebSite structured data. Emitted once here so no
  // page duplicates it. Both builders return `null` when there is no site
  // origin/brand configured, and `JsonLd` renders nothing for `null`.
  const [settings, about] = await Promise.all([
    getSiteSettings(),
    // The site must still render when the About section cannot be read.
    getAbout().catch(() => null),
  ]);
  const person = personJsonLd({
    siteSeo: settings.seo,
    brandName: settings.brand.name,
    name: about?.hero?.name,
    jobTitle: about?.hero?.title,
    image: about?.hero?.image,
    socials: settings.socials,
  });
  const website = websiteJsonLd({
    siteSeo: settings.seo,
    brandName: settings.brand.name,
  });

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <JsonLd data={person} />
        <JsonLd data={website} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
