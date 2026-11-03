// import { Briefcase, Wrench } from "lucide-react";
// import { ServicesGrid } from "../../components/services/ServicesGrid";
// import { ServicesCTA } from "../../components/services/ServicesCTA";
// import { getServices } from "@/lib/api/services";
// import { EmptyState } from "@/app/components/EmptyState";
// import { getSiteSettings } from "@/lib/api/settings";
// import { getPageSeo } from "@/lib/api/seo";
// import { buildMetadata } from "@/lib/seo/metadata";

// export async function generateMetadata() {
//   const [settings, seo] = await Promise.all([
//     getSiteSettings(),
//     getPageSeo("services"),
//   ]);

//   return buildMetadata({
//     path: "/services",
//     title: "Services",
//     description:
//       "Full-stack development services — frontend, backend, database design, API integration and more.",
//     seo,
//     siteSeo: settings.seo,
//   });
// }

// export default async function ServicesPage() {
//   // Cached 60s under tag "services"; last-good-on-failure; demo data on build.
//   const services = await getServices();

//   if (!services || services.length === 0) {
//     return (
//       <div className="min-h-screen bg-white dark:bg-zinc-950">
//         <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
//           <EmptyState
//             icon={Wrench}
//             title="No Services Available Right Now"
//             description="We are currently updating our service offerings. Please check back soon!"
//           />
//         </div>
//       </div>
//     );
//   }
//   return (
//     <div className="min-h-screen bg-white dark:bg-zinc-950">
//       <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
//         {/* Header */}
//         <div className="mb-14 max-w-2xl">
//           <div className="flex items-center gap-3 mb-4">
//             <div
//               className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950
//                             flex items-center justify-center"
//             >
//               <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
//             </div>
//             <span
//               className="text-sm font-medium text-indigo-600 dark:text-indigo-400
//                              uppercase tracking-wider"
//             >
//               What I offer
//             </span>
//           </div>

//           <h1
//             className="text-4xl sm:text-5xl font-bold
//                          text-zinc-900 dark:text-white mb-4"
//           >
//             Services
//           </h1>
//           <p className="text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed">
//             From a simple landing page to a complete web application with
//             authentication, database and admin panel — I handle the full stack
//             so you don&apos;t have to juggle multiple developers.
//           </p>
//         </div>

//         {/* Services grid */}
//         <ServicesGrid services={services} />
//         {/* CTA */}
//         <ServicesCTA />
//       </div>
//     </div>
//   );
// }


import { Briefcase, Wrench } from "lucide-react";
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

const enter = (ms: number) => ({ animationDelay: `${ms}ms` });

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
        <div className="mb-14 max-w-2xl">
          <div
            className="animate-fade-up flex items-center gap-3 mb-4"
            style={enter(0)}
          >
            <div
              className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950
                         flex items-center justify-center"
            >
              <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span
              className="text-sm font-medium text-indigo-600 dark:text-indigo-400
                         uppercase tracking-wider"
            >
              What I offer
            </span>
          </div>

          <h1
            className="animate-fade-up text-4xl sm:text-5xl font-bold
                       text-zinc-900 dark:text-white mb-4"
            style={enter(100)}
          >
            Services
          </h1>
          <p
            className="animate-fade-up text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed"
            style={enter(200)}
          >
            From a simple landing page to a complete web application with
            authentication, database and admin panel — I handle the full stack
            so you don&apos;t have to juggle multiple developers.
          </p>
        </div>

        {/* Services grid */}
        <ServicesGrid services={services} />
        {/* CTA */}
        <ServicesCTA />
      </div>
    </div>
  );
}
