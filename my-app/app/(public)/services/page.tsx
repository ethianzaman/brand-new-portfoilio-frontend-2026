import { Briefcase, Wrench } from "lucide-react";
import { SectionHeader } from "@/app/components/SectionHeader";
import { ServicesGrid } from "../../components/services/ServicesGrid";
import { ServicesCTA } from "../../components/services/ServicesCTA";
import { getServices } from "@/lib/api/services";
import { EmptyState } from "@/app/components/EmptyState";
import { getSiteSettings } from "@/lib/api/settings";
import { getPageSeo } from "@/lib/api/seo";
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateMetadata() {
  const [settings, seo] = await Promise.all([
    getSiteSettings(),
    getPageSeo("services"),
  ]);

  return buildMetadata({
    path: "/services",
    title: "Services",
    description:
      "Full-stack development services — frontend, backend, database design, API integration and more.",
    seo,
    siteSeo: settings.seo,
  });
}

export default async function ServicesPage() {
  // Cached 60s under tag "services"; last-good-on-failure; demo data on build.
  const services = await getServices();

  if (!services || services.length === 0) {
    return (
      <div className="relative isolate min-h-screen overflow-x-clip">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
          <EmptyState
            icon={Wrench}
            title="No Services Available Right Now"
            description="We are currently updating our service offerings. Please check back soon!"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative isolate min-h-screen overflow-x-clip">
      <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        {/* Header */}
        <SectionHeader
          className="mb-14 max-w-2xl"
          icon={Briefcase}
          socialPlacement="services"
          eyebrow="What I offer"
          title="Services"
          description="From a simple landing page to a complete web application with authentication, database and admin panel — I handle the full stack so you don't have to juggle multiple developers."
        />

        {/* Services grid */}
        <ServicesGrid services={services} />
        {/* CTA */}
        <ServicesCTA />
      </div>
    </div>
  );
}
