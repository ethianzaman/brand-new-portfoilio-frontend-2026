import type { LucideIcon } from "lucide-react";
import { SocialLinks } from "@/app/components/brand/SocialLinks";
import Reveal from "@/app/components/motion/Reveal";
import { PageHeading } from "@/app/components/PageHeading";
import type { SocialPlacement } from "@/lib/socials";
import { cn } from "@/lib/utils";

type Props = {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  /** Shows the links selected for this section, if any, under the intro. */
  socialPlacement?: SocialPlacement;
};

/** Icon + eyebrow, title and intro at the top of each public section. */
export function SectionHeader({
  icon: Icon,
  eyebrow,
  title,
  description,
  className,
  titleClassName,
  descriptionClassName,
  socialPlacement,
}: Props) {
  return (
    <div className={className}>
      <Reveal className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950
                     flex items-center justify-center"
        >
          <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <span
          className="text-sm font-medium text-indigo-600 dark:text-indigo-400
                     uppercase tracking-wider"
        >
          {eyebrow}
        </span>
      </Reveal>

      <Reveal delay={100}>
        <PageHeading
          className={cn(
            "text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-white mb-4",
            titleClassName,
          )}
        >
          {title}
        </PageHeading>
      </Reveal>

      <Reveal delay={200}>
        <p
          className={cn(
            "text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed",
            descriptionClassName,
          )}
        >
          {description}
        </p>
      </Reveal>

      {socialPlacement && (
        <Reveal delay={300}>
          <SocialLinks placement={socialPlacement} className="-ml-2 mt-3" />
        </Reveal>
      )}
    </div>
  );
}
