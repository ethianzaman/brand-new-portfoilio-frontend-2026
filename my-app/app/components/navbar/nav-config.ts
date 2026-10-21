import {
  Home,
  User,
  Briefcase,
  FileText,
  Mail,
  LayoutDashboard,
  Wrench,
} from "lucide-react";

// Nav links are Navbar-specific and stay here. The shared brand name and the
// social links now come from Global Site Settings (`/lib/api/settings.ts`).
export const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/about", label: "About", icon: User },
  { href: "/services", label: "Services", icon: Wrench },
  { href: "/projects", label: "Projects", icon: Briefcase },
  { href: "/skills", label: "Skills", icon: FileText },
  { href: "/blog", label: "Blog", icon: FileText },
  { href: "/contact", label: "Contact", icon: Mail },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];
