import type { MetadataRoute } from "next";
import { getSiteSettings } from "@/lib/api/settings";
import { resolveSiteOrigin } from "@/lib/seo/metadata";

/**
 * robots.txt.
 *
 * Allows crawling of the public site and disallows the dashboard and the
 * internal API routes (which are never useful to a crawler). The sitemap line
 * is emitted only when a site origin is configured.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSiteSettings();
  const origin = resolveSiteOrigin(settings.seo?.siteUrl);

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/api"],
    },
    sitemap: origin ? `${origin}/sitemap.xml` : undefined,
    host: origin || undefined,
  };
}
