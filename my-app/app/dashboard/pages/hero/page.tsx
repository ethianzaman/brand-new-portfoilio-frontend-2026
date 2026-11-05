import { Home as HomeIcon } from "lucide-react";
import { HeroCMS } from "./HeroCMS";
import { PageHeader } from "@/app/components/dashboard/PageHeader";
import { dashboardGetHero } from "@/lib/services/hero.service";
import { DEMO_HERO } from "@/lib/data/hero.demo";

export default async function DashboardHomePage() {
  // Dashboard reads always bypass the public ISR cache. If the backend is
  // down we seed the CMS with demo data so the screen is still usable.
  const hero = await dashboardGetHero().catch(() => DEMO_HERO);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon={HomeIcon}
        title="Hero Page"
        description="Manage your landing page hero, image, resume & statistics"
      />

      <HeroCMS initial={hero} />
    </div>
  );
}
