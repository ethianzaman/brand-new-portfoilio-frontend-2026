// import { Mail, Phone, MapPin, Clock, ArrowUpRight } from "lucide-react";
// import { GithubIcon,LinkedinIcon,TwitterIcon } from "@/app/components/icon/brandIcons";

// const contactDetails = [
//   {
//     icon: Mail,
//     label: "Email",
//     value: "ethian@example.com",
//     href: "mailto:ethian@example.com",
//     color: "#6366f1",
//   },
//   {
//     icon: Phone,
//     label: "WhatsApp",
//     value: "+1 234 567 890",
//     href: "https://wa.me/1234567890",
//     color: "#10b981",
//   },
//   {
//     icon: MapPin,
//     label: "Location",
//     value: "Available Worldwide",
//     href: null,
//     color: "#f59e0b",
//   },
//   {
//     icon: Clock,
//     label: "Response Time",
//     value: "Within 24 hours",
//     href: null,
//     color: "#06b6d4",
//   },
// ];

// const socials = [
//   {
//     label: "GitHub",
//     href: "https://github.com",
//     Icon: GithubIcon,
//     desc: "Check my open source work",
//   },
//   {
//     label: "LinkedIn",
//     href: "https://linkedin.com",
//     Icon: LinkedinIcon,
//     desc: "Connect professionally",
//   },
//   {
//     label: "Twitter",
//     href: "https://twitter.com",
//     Icon: TwitterIcon,
//     desc: "Follow for dev updates",
//   },
// ];


// export function ContactInfo() {
//   return (
//     <div className="flex flex-col gap-4 h-full">
//       {/* Contact details */}
//       <div
//         className="flex flex-col gap-4 p-6 rounded-2xl
//                       bg-white dark:bg-zinc-900
//                       border border-zinc-200 dark:border-zinc-800"
//       >
//         <h3
//           className="text-sm font-semibold text-zinc-900 dark:text-white
//                        uppercase tracking-wider"
//         >
//           Contact Details
//         </h3>

//         <div className="flex flex-col gap-3">
//           {contactDetails.map(({ icon: Icon, label, value, href, color }) => (
//             <div key={label} className="flex items-center gap-3">
//               <div
//                 className="w-9 h-9 rounded-xl flex items-center
//                            justify-center shrink-0"
//                 style={{ backgroundColor: `${color}18` }}
//               >
//                 <Icon className="w-4 h-4" style={{ color }} />
//               </div>
//               <div className="flex flex-col min-w-0">
//                 <span className="text-xs text-zinc-400 dark:text-zinc-500">
//                   {label}
//                 </span>
//                 {href ? (
//                   <a // ✅ Added opening tag
//                     href={href}
//                     target="_blank"
//                     rel="noreferrer"
//                     className="text-sm font-medium text-zinc-800 dark:text-zinc-200
//                hover:text-indigo-600 dark:hover:text-indigo-400
//                transition-colors truncate"
//                   >
//                     {value}
//                   </a>
//                 ) : (
//                   <span
//                     className="text-sm font-medium
//                                    text-zinc-800 dark:text-zinc-200"
//                   >
//                     {value}
//                   </span>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Availability */}
//       <div
//         className="flex items-center gap-3 px-5 py-4 rounded-2xl
//                       bg-green-50 dark:bg-green-950/30
//                       border border-green-200 dark:border-green-800"
//       >
//         <span className="relative flex w-3 h-3 shrink-0">
//           <span
//             className="animate-ping absolute inline-flex h-full w-full
//                            rounded-full bg-green-400 opacity-75"
//           />
//           <span className="relative inline-flex rounded-full w-3 h-3 bg-green-500" />
//         </span>
//         <div>
//           <p className="text-sm font-semibold text-green-700 dark:text-green-400">
//             Available for new projects
//           </p>
//           <p className="text-xs text-green-600/70 dark:text-green-500">
//             Currently accepting work
//           </p>
//         </div>
//       </div>

//       {/* Social links */}
//       <div
//         className="flex flex-col gap-2 p-6 rounded-2xl
//                       bg-white dark:bg-zinc-900
//                       border border-zinc-200 dark:border-zinc-800
//                       flex-1"
//       >
//         <h3
//           className="text-sm font-semibold text-zinc-900 dark:text-white
//                        uppercase tracking-wider mb-1"
//         >
//           Find me on
//         </h3>
//         {socials.map(({ label, href, Icon, desc }) => (
//           <a // ✅ Added opening tag
//             key={label}
//             href={href}
//             target="_blank"
//             rel="noreferrer"
//             className="flex items-center gap-3 p-3 rounded-xl
//                hover:bg-zinc-50 dark:hover:bg-zinc-800
//                transition-colors group"
//           >
//             <div
//               className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800
//                     flex items-center justify-center shrink-0
//                     group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950
//                     transition-colors"
//             >
//               <Icon
//                 className="w-4 h-4 text-zinc-600 dark:text-zinc-400
//                        group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
//               />
//             </div>
//             <div className="flex flex-col flex-1 min-w-0">
//               <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
//                 {label}
//               </span>
//               <span className="text-xs text-zinc-400 dark:text-zinc-500">
//                 {desc}
//               </span>
//             </div>
//             <ArrowUpRight
//               className="w-4 h-4 text-zinc-300 dark:text-zinc-600
//                              group-hover:text-indigo-500
//                              transition-colors shrink-0"
//             />
//           </a>
//         ))}
//       </div>
//     </div>
//   );
// }


'use client'

import {
  Mail,
  Phone,
  MapPin,
  Clock,
  ArrowUpRight,
} from 'lucide-react'

import {
  GithubIcon,
  LinkedinIcon,
  TwitterIcon,
} from '@/app/components/icon/brandIcons'

import { ContactInfo as ContactInfoType } from '@/lib/types/contact'

interface ContactInfoProps {
  info: ContactInfoType
}

export function ContactInfo({ info }: ContactInfoProps) {
  const contactDetails = [
    {
      icon: Mail,
      label: 'Email',
      value: info.email,
      href: `mailto:${info.email}`,
      color: '#6366f1',
    },
    {
      icon: Phone,
      label: 'Phone',
      value: info.phone,
      href: `tel:${info.phone}`,
      color: '#10b981',
    },
    {
      icon: MapPin,
      label: 'Location',
      value: info.location,
      href: null,
      color: '#f59e0b',
    },
    {
      icon: Clock,
      label: 'Response Time',
      value: info.responseTime,
      href: null,
      color: '#06b6d4',
    },
  ]

  const socials = [
    {
      label: 'GitHub',
      href: info.socials.github,
      Icon: GithubIcon,
      desc: 'Check my open source work',
    },
    {
      label: 'LinkedIn',
      href: info.socials.linkedin,
      Icon: LinkedinIcon,
      desc: 'Connect professionally',
    },
    {
      label: 'Twitter',
      href: info.socials.twitter,
      Icon: TwitterIcon,
      desc: 'Follow for dev updates',
    },
  ]

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="rounded-2xl border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 p-6">
        <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider">
          Contact Details
        </h3>

        <div className="space-y-4">
          {contactDetails.map(({ icon: Icon, label, value, href, color }) => (
            <div key={label} className="flex gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${color}18` }}
              >
                <Icon className="h-5 w-5" style={{ color }} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs text-zinc-500">{label}</p>

                {href ? (
                  <a
                    href={href}
                    className="font-medium break-all hover:text-indigo-600"
                  >
                    {value}
                  </a>
                ) : (
                  <p className="font-medium break-all">{value}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20 p-5">
        <p className="font-semibold text-green-700">
          {info.available
            ? 'Available for new projects'
            : 'Currently unavailable'}
        </p>

        <p className="text-sm text-green-600">
          {info.availableText}
        </p>
      </div>

      <div className="rounded-2xl border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 p-6">
        <h3 className="mb-4 font-semibold">
          Find me on
        </h3>

        <div className="space-y-2">
          {socials.map(({ label, href, Icon, desc }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-xl p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <Icon className="h-5 w-5" />

              <div className="flex-1">
                <p className="font-medium">{label}</p>
                <p className="text-xs text-zinc-500">{desc}</p>
              </div>

              <ArrowUpRight className="h-4 w-4" />
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}