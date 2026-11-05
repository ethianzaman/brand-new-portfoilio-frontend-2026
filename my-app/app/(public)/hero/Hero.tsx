import { getHeroData } from "@/lib/api/hero";
import { getSkills } from "@/lib/api/skills";
import { getSiteSettings } from "@/lib/api/settings";
import { legacySocial, resolveSocials } from "@/lib/socials";
import HeroCTA from "@/app/components/hero/HeroCTA";
import HeroIntro from "@/app/components/hero/HeroIntro";
import HeroSkills from "@/app/components/hero/HeroSkills";
import HeroStats from "@/app/components/hero/HeroStats";

export default async function Hero() {
  // 60s ISR + tag "hero", 5s timeout, last-good-on-failure, demo data on build.
  const [data, settings, skills] = await Promise.all([
    getHeroData(),
    getSiteSettings(),
    getSkills(),
  ]);
  const socials = settings.socialsConfigured
    ? resolveSocials(settings, "homeHero")
    : data.hero.socials.map(({ label, href }) => legacySocial(label, href));

  return (
    <div className="min-h-screen overflow-x-clip">
      <HeroIntro hero={data.hero} topStat={data.stats[0]} socials={socials} />
      <HeroStats stats={data.stats} />
      <HeroSkills categories={skills} />
      <HeroCTA />
    </div>
  );
}
