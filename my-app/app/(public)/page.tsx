import type { Metadata } from "next";
import ServicesPage from "./services/page";
import ContactPage from "./contact/page";
import Hero from "./hero/Hero";
import { NestedPage } from "@/app/components/PageHeading";
import ProjectsPage from "./projects/page";
import AboutPage from "./about/page";
import BlogPage from "./blog/page";
import { getSiteSettings } from "@/lib/api/settings";
import { getPageSeo } from "@/lib/api/seo";
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const [settings, seo] = await Promise.all([
    getSiteSettings(),
    getPageSeo("home"),
  ]);

  return buildMetadata({
    path: "/",
    title: settings.brand.name || "Home",
    description: settings.brand.tagline || undefined,
    seo,
    siteSeo: settings.seo,
  });
}

export default function Home() {
  return (
    <div>
      <Hero />
      <NestedPage>
        <ServicesPage />
        <ProjectsPage />
        <AboutPage />
        <BlogPage />
        <ContactPage />
      </NestedPage>
    </div>
  );
}