import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

import Reveal from "@/app/components/motion/Reveal";
import SpotlightCard from "@/app/components/motion/SpotlightCard";
import { JsonLd } from "@/app/components/seo/JsonLd";
import { ServiceIcon } from "@/app/components/services/ServiceIcon";
import { ServicesCTA } from "@/app/components/services/ServicesCTA";
import { getServiceBySlug, getServices } from "@/lib/api/services";
import { getSiteSettings } from "@/lib/api/settings";
import { serviceJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const [service, settings] = await Promise.all([
    getServiceBySlug(slug),
    getSiteSettings(),
  ]);

  if (!service) return { title: "Service not found" };

  return buildMetadata({
    path: `/services/${service.slug}`,
    title: service.title,
    description: service.description,
    seo: service.seo,
    siteSeo: settings.seo,
  });
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) notFound();

  const [settings, all] = await Promise.all([getSiteSettings(), getServices()]);
  const others = all.filter((s) => s.id !== service.id && s.slug);

  return (
    <div className="min-h-screen">
      <JsonLd
        data={serviceJsonLd({
          title: service.title,
          description: service.description,
          path: `/services/${service.slug}`,
          siteSeo: settings.seo,
        })}
      />

      <div className="mx-auto max-w-4xl px-4 py-16 md:py-24">
        <Reveal>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400"
          >
            <ArrowLeft className="h-4 w-4" />
            All services
          </Link>
        </Reveal>

        <Reveal delay={100} className="mt-8">
          <span
            className="flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ backgroundColor: `${service.color}18` }}
          >
            <ServiceIcon icon={service.icon} color={service.color} className="h-7 w-7" />
          </span>
        </Reveal>

        <Reveal delay={200}>
          <h1 className="mt-5 text-3xl font-bold leading-tight text-zinc-900 sm:text-4xl md:text-5xl dark:text-white">
            {service.title}
          </h1>
        </Reveal>

        <Reveal delay={300}>
          <p className="mt-4 text-base leading-relaxed text-zinc-600 md:text-lg dark:text-zinc-400">
            {service.description}
          </p>
        </Reveal>

        {service.features.length > 0 && (
          <Reveal className="mt-10">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              What&apos;s included
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {service.features.map((feature) => (
                <li key={feature.text}>
                  <SpotlightCard
                    className="h-full rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                    contentClassName="flex items-start gap-3"
                  >
                  <span
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${service.color}20` }}
                  >
                    <Check
                      className="h-3 w-3"
                      style={{ color: service.color }}
                      strokeWidth={3}
                    />
                  </span>
                  {feature.text}
                  </SpotlightCard>
                </li>
              ))}
            </ul>
          </Reveal>
        )}

        {service.tags.length > 0 && (
          <Reveal className="mt-10">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              Tools &amp; technologies
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {service.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-lg bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </Reveal>
        )}

        <ServicesCTA />

        {others.length > 0 && (
          <Reveal className="mt-16">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              Other services
            </h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {others.map((other) => (
                <li key={other.id}>
                  <SpotlightCard className="rounded-xl border border-zinc-200 bg-white hover:border-indigo-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-700">
                    <Link
                      href={`/services/${other.slug}`}
                      className="flex items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-zinc-800 transition-colors hover:text-indigo-600 dark:text-zinc-200 dark:hover:text-indigo-400"
                    >
                      {other.title}
                      <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </SpotlightCard>
                </li>
              ))}
            </ul>
          </Reveal>
        )}
      </div>
    </div>
  );
}
