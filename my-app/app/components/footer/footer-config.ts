import {
  Home, User, Briefcase,
   Mail, Wrench, Code2,
} from 'lucide-react'

export const footerConfig = {
  // Brand NAME + LOGO and the SOCIAL LINKS are global
  // (see /lib/api/settings.ts). Service titles come from the Services API, the
  // email/phone/location come from the Contact API and the tech-stack pills
  // come from the Skills API — only genuinely static footer copy lives here.
  brand: {
    bio: 'Building fast, scalable and beautiful web applications. Available for freelance projects worldwide.',
  },

  pages: [
    { label: 'Home',     href: '/',         icon: Home      },
    { label: 'About',    href: '/about',     icon: User      },
    { label: 'Services', href: '/services',  icon: Wrench    },
    { label: 'Projects', href: '/projects',  icon: Briefcase },
    { label: 'Skills',   href: '/skills',    icon: Code2     },
    { label: 'Contact',  href: '/contact',   icon: Mail      },
  ],
}
