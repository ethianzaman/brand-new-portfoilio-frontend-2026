import { getSiteSettings } from "@/lib/api/settings";
import { resolveSocials, type SocialPlacement } from "@/lib/socials";
import { cn } from "@/lib/utils";
import { SocialIcon } from "./SocialIcon";

/** A section's social links. Renders nothing when none are selected for it. */
export async function SocialLinks({
  placement,
  className,
}: {
  placement: SocialPlacement;
  className?: string;
}) {
  const socials = resolveSocials(await getSiteSettings(), placement);
  if (socials.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-1", className)}>
      {socials.map(({ id, label, href, icon, imageUrl }) => (
        <a
          key={id}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="rounded-xl border border-transparent p-2 text-zinc-500 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-100 hover:bg-indigo-50 hover:text-indigo-600 dark:text-zinc-400 dark:hover:border-indigo-900 dark:hover:bg-indigo-950 dark:hover:text-indigo-300"
        >
          <SocialIcon icon={icon} imageUrl={imageUrl} className="h-5 w-5" />
        </a>
      ))}
    </div>
  );
}
