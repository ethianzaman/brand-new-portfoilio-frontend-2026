"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { Check, Info, Loader2, TriangleAlert, X } from "lucide-react"

const iconBase =
  "flex size-5 items-center justify-center rounded-full"

/**
 * The one toast of the app: a pill that inverts against the page, whose icon
 * says what happened. Errors turn red, because they need the reader to act.
 * Every dashboard page and the login form use it.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      closeButton
      duration={3000}
      icons={{
        success: (
          <span className={`${iconBase} bg-emerald-500/20 text-emerald-500`}>
            <Check className="size-3.5 stroke-3" />
          </span>
        ),
        info: (
          <span className={`${iconBase} bg-indigo-500/20 text-indigo-500`}>
            <Info className="size-3.5 stroke-3" />
          </span>
        ),
        warning: (
          <span className={`${iconBase} bg-amber-500/20 text-amber-500`}>
            <TriangleAlert className="size-3.5 stroke-3" />
          </span>
        ),
        error: (
          <span className={`${iconBase} bg-white/20 text-white`}>
            <X className="size-3.5 stroke-3" />
          </span>
        ),
        loading: (
          <span className={iconBase}>
            <Loader2 className="size-3.5 animate-spin" />
          </span>
        ),
      }}
      toastOptions={{
        classNames: {
          toast:
            "inset-x-0! mx-auto! w-fit! max-w-[calc(100vw-2rem)]! gap-3! rounded-2xl! border! border-white/10! bg-zinc-900! px-5! py-3! text-white! shadow-2xl! [font-family:inherit]! dark:border-zinc-200! dark:bg-white! dark:text-zinc-900! data-[type=error]:border-red-500! data-[type=error]:bg-red-600! data-[type=error]:text-white! dark:data-[type=error]:border-red-500! dark:data-[type=error]:bg-red-600! dark:data-[type=error]:text-white!",
          title: "text-sm! font-semibold! text-inherit!",
          description: "text-xs! text-inherit! opacity-80!",
          icon: "m-0! size-5! shrink-0!",
          actionButton:
            "ml-1! rounded-lg! bg-indigo-600! px-3! py-1.5! text-xs! font-semibold! text-white! hover:bg-indigo-700!",
          closeButton:
            "border-zinc-200! bg-white! text-zinc-500! hover:text-zinc-900! dark:border-zinc-700! dark:bg-zinc-900! dark:text-zinc-400! dark:hover:text-white!",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

