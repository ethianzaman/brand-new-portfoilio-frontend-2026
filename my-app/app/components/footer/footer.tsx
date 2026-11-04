import Link from "next/link";
import Reveal from "@/app/components/motion/Reveal";
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import { footerConfig } from "./footer-config";
import { BrandMark } from "../brand/BrandMark";
import { SocialIcon } from "../brand/SocialIcon";
import { resolveSocials } from "@/lib/socials";
import type { SiteSettings } from "@/lib/types/settings";
import { getServices } from "@/lib/api/services";
import { getContact } from "@/lib/api/contact";
import { getSkills } from "@/lib/api/skills";
import BackToTop from "./BackToTop";

/** Max tech-stack pills shown in the footer before truncating. */
const FOOTER_STACK_LIMIT = 8;

export async function Footer({ settings }: { settings: SiteSettings }) {
  const { brand, pages } = footerConfig;
  const { name: brandName, logo } = settings.brand;
  const socials = resolveSocials(settings, "footer");
  // Reuse the public sections' own data sources so the footer can never drift
  // from the /services, /contact and /skills pages. Cached under the same
  // `services` / `contact` / `skills` tags and refreshed by the backend's
  // publishChange().
  const [services, contact, skillCategories] = await Promise.all([
    getServices(),
    getContact(),
    getSkills(),
  ]);
  const { email, phone, location } = contact.info;
  const stack = skillCategories
    .flatMap((category) => category.skills.map((skill) => skill.name))
    .filter(Boolean)
    .slice(0, FOOTER_STACK_LIMIT);
  const year = new Date().getFullYear();

  return (
    <footer className="bg-zinc-950 text-zinc-400 border-t border-zinc-900">
      {/* ── Top Section: CTA ── */}
      <div className="max-w-7xl mx-auto px-6 py-12 border-b border-zinc-900">
        <Reveal className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Ready to start a project?
            </h2>
            <p className="text-zinc-500 max-w-md">
              Currently available for freelance work and full-time
              opportunities.
            </p>
          </div>
          <Link
            href="/contact"
            className="btn-shine group flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl transition-all font-medium"
          >
            Get in touch
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Reveal>
      </div>

      {/* ── Middle Section: Links ── */}
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <Reveal className="flex flex-col gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center overflow-hidden">
                <BrandMark
                  logo={logo}
                  className="w-5 h-5 text-white fill-white"
                />
              </div>
              {brandName && (
                <span className="text-lg font-bold text-white tracking-tight">
                  {brandName}
                </span>
              )}
            </div>
            <p className="text-sm leading-relaxed">{brand.bio}</p>
            <div className="flex gap-3">
              {socials.map(({ id, label, href, icon, imageUrl }) => (
                <a
                  key={id}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:border-indigo-500 hover:text-white transition-all"
                >
                  <SocialIcon icon={icon} imageUrl={imageUrl} className="w-5 h-5" />
                </a>
              ))}
            </div>
          </Reveal>

          {/* Quick Links */}
          <Reveal delay={90}>
            <h3 className="text-white font-semibold mb-6">Navigation</h3>
            <ul className="space-y-4">
              {pages.map((page) => (
                <li key={page.label}>
                  <Link
                    href={page.href}
                    className="flex items-center gap-2 hover:text-white transition-colors group"
                  >
                    <page.icon className="w-4 h-4 text-zinc-600 group-hover:text-indigo-400 transition-colors" />
                    {page.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Services */}
          <Reveal delay={180}>
            <h3 className="text-white font-semibold mb-6">Services</h3>
            <ul className="space-y-4 text-sm">
              {services.map((service) => (
                <li key={service.id}>
                  <Link
                    href="/services"
                    className="hover:text-white transition-colors"
                  >
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Contact Info */}
          <Reveal delay={270} className="flex flex-col gap-6">
            <h3 className="text-white font-semibold">Contact</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 shrink-0 text-indigo-500" />
                <span className="min-w-0 break-all">{email}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 shrink-0 text-indigo-500" />
                <span className="min-w-0 break-all">{phone}</span>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="w-4 h-4 shrink-0 text-indigo-500" />
                <span className="min-w-0 break-all">{location}</span>
              </li>
            </ul>
            {/* Tech Stack Pills */}
            <div className="flex flex-wrap gap-2 mt-2">
              {stack.map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-1 bg-zinc-900 text-[10px] font-bold uppercase tracking-widest text-zinc-500 rounded border border-zinc-800"
                >
                  {tech}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="bg-zinc-950 border-t border-zinc-900 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-col justify-between items-center gap-4">
          <p className="text-xs">
            © {year} {brandName}. All rights reserved, Designed & developed
            Built with using Next.js.
          </p>
          <BackToTop />
        </div>
      </div>
    </footer>
  );
}
