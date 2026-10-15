"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className=" size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
          error: "bg-red-600! text-white! border-red-500! dark:bg-red-700!",
          success: "bg-green-600! text-white! border-green-500! dark:bg-green-700!",
          title: "text-white!",
          description: "text-white/90!",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }



// "use client";

// import { useTheme } from "next-themes";
// import { Toaster as Sonner, type ToasterProps } from "sonner";
// import {
//   CircleCheckIcon,
//   InfoIcon,
//   TriangleAlertIcon,
//   OctagonXIcon,
//   Loader2Icon,
// } from "lucide-react";

// const Toaster = ({ ...props }: ToasterProps) => {
//   const { theme = "system" } = useTheme();

//   return (
//     <Sonner
//       theme={theme as ToasterProps["theme"]}
//       position="top-center"
//       duration={3000}
//       closeButton={false}
//       richColors={false}
//       className="toaster group"
//       icons={{
//         success: <CircleCheckIcon className="size-4" />,
//         info: <InfoIcon className="size-4" />,
//         warning: <TriangleAlertIcon className="size-4" />,
//         error: <OctagonXIcon className="size-4" />,
//         loading: <Loader2Icon className="size-4 animate-spin" />,
//       }}
//       style={
//         {
//           "--normal-bg": "var(--popover)",
//           "--normal-text": "var(--popover-foreground)",
//           "--normal-border": "var(--border)",
//           "--border-radius": "1rem",
//         } as React.CSSProperties
//       }
//       toastOptions={{
//         classNames: {
//           toast:
//             "rounded-2xl! border! shadow-2xl! px-5! py-3! gap-3! font-semibold! text-sm!",
//           success:
//             "bg-zinc-900! text-white! border-zinc-700! dark:bg-white! dark:text-zinc-900! dark:border-zinc-200!",
//           error:
//             "bg-red-600! text-white! border-red-500! dark:bg-red-700! dark:border-red-600!",
//           info:
//             "bg-zinc-900! text-white! border-zinc-700! dark:bg-white! dark:text-zinc-900! dark:border-zinc-200!",
//           warning:
//             "bg-amber-500! text-white! border-amber-400! dark:bg-amber-600! dark:border-amber-500!",
//           loading:
//             "bg-zinc-900! text-white! border-zinc-700! dark:bg-white! dark:text-zinc-900! dark:border-zinc-200!",
//           title: "font-semibold!",
//           description: "opacity-90!",
//           icon: "shrink-0!",
//         },
//       }}
//       {...props}
//     />
//   );
// };

// export { Toaster };
