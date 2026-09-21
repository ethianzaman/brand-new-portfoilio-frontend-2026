import { Home as HomeIcon } from "lucide-react";
import { HomeCMS } from "./HomeCMS";
import { dashboardGetHero } from "@/lib/services/hero.services";
import { DEMO_HOME } from "@/lib/data/home.demo";

export default async function DashboardHomePage() {
  // ব্যাকএন্ড ডাউন থাকলে demo data দিয়ে CMS দেখানো হয়
  const hero = await dashboardGetHero().catch(() => DEMO_HOME);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl
                        bg-indigo-50 dark:bg-indigo-950
                        flex items-center justify-center"
        >
          <HomeIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
            Home Page
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Manage your landing page hero, image, resume &amp; statistics
          </p>
        </div>
      </div>

      <HomeCMS initial={hero} />
    </div>
  );
}
