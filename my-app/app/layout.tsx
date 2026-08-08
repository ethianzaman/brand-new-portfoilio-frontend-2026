
"use client";
import { Inter as FontSans } from "next/font/google" 
import { cn } from "@/lib/utils"
import "./globals.css"


const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export default function RootLayout({ children, }: { children: React.ReactNode }) {
  // const pathName = usePathname();
  // const isDashboard = pathName.startsWith("/dashboard");
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        {/* {!isDashboard && <Navbar />} */}
        {children}
      </body>
    </html>
  )
}