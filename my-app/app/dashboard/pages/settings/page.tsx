"use client";

import { useSyncExternalStore, useState } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Bell,
  Check,
  LogOut,
  Monitor,
  Moon,
  Palette,
  Settings,
  Sun,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { adminProfile } from "@/app/components/dashboard/sidebar-config";
import { useCurrentUser } from "@/app/components/dashboard/useCurrentUser";
import { ROLE_LABELS } from "@/lib/types/user";
import { BrandSettings } from "./BrandSettings";
import { SocialSettings } from "./SocialSettings";

const emptySubscribe = () => () => {};

const themeOptions = [
  { value: "light", label: "Light", icon: Sun, desc: "Bright & clean" },
  { value: "dark", label: "Dark", icon: Moon, desc: "Easy on the eyes" },
  { value: "system", label: "System", icon: Monitor, desc: "Match device" },
] as const;

const preferences = [
  {
    id: "email",
    label: "Email notifications",
    desc: "Get an email when someone sends a message",
    icon: Bell,
    defaultOn: true,
  },
  {
    id: "autosave",
    label: "Auto-save drafts",
    desc: "Keep form changes while you are editing",
    icon: Palette,
    defaultOn: true,
  },
] as const;

type Preference = (typeof preferences)[number];

function Toggle({
  on,
  onClick,
  label,
}: {
  on: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onClick}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200",
        on ? "bg-indigo-600" : "bg-zinc-300 dark:bg-zinc-600",
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out",
          on ? "translate-x-6" : "translate-x-1",
        )}
      />
    </button>
  );
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const router = useRouter();
  const { user } = useCurrentUser();

  const email = user?.email ?? adminProfile.email;
  const roleLabel = user ? ROLE_LABELS[user.role] : adminProfile.role;
  const initials =
    email
      .split(/[._@-]/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "U";

  const [prefs, setPrefs] = useState<Record<string, boolean>>(
    Object.fromEntries(preferences.map((p) => [p.id, p.defaultOn])),
  );

  function togglePref(pref: Preference) {
    const next = !prefs[pref.id];
    setPrefs((prev) => ({ ...prev, [pref.id]: next }));
    toast.success(`${pref.label} ${next ? "enabled" : "disabled"}`, {
      duration: 2000,
    });
  }

  function chooseTheme(value: string) {
    setTheme(value);
    toast.success(
      `Appearance set to ${value.charAt(0).toUpperCase() + value.slice(1)}`,
      { duration: 2000 },
    );
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  const activeTheme = mounted ? theme : null;

  return (
    <div className="flex flex-col gap-6">
      {/* ── Page header ── */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950">
          <Settings className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
            Settings
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Manage the global brand, shared social links, appearance,
            preferences and your account
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* ── Global brand (shared by Navbar + Footer) ── */}
        <BrandSettings />

        {/* ── Shared social links (dynamically add/remove) ── */}
        <SocialSettings />

        {/* ── Appearance ── */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-4 flex items-center gap-2.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <Sun className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
                Appearance
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Switch between light and dark mode
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {themeOptions.map((option) => {
              const selected = activeTheme === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => chooseTheme(option.value)}
                  className={cn(
                    "group relative flex flex-col items-center gap-2 rounded-xl border p-3 sm:p-4 transition-all duration-200",
                    selected
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 shadow-sm"
                      : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/50",
                  )}
                >
                  {selected && (
                    <span className="absolute right-1.5 top-1.5 grid h-4 w-4 place-items-center rounded-full bg-indigo-600">
                      <Check className="h-2.5 w-2.5 text-white" />
                    </span>
                  )}
                  <span
                    className={cn(
                      "grid h-9 w-9 place-items-center rounded-lg transition-colors",
                      selected
                        ? "bg-indigo-600 text-white"
                        : "bg-zinc-100 text-zinc-500 group-hover:text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:group-hover:text-zinc-200",
                    )}
                  >
                    <option.icon className="h-4 w-4" />
                  </span>
                  <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                    {option.label}
                  </span>
                  <span className="hidden text-[10px] text-zinc-400 dark:text-zinc-500 sm:block">
                    {option.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Account ── */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-4 flex items-center gap-2.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <User className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
                Account
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Your profile and session
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 rounded-xl bg-zinc-50 p-3 ring-1 ring-inset ring-zinc-100 dark:bg-zinc-800/50 dark:ring-zinc-800">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white shadow-md shadow-indigo-600/30">
              {initials}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-zinc-900 dark:text-white">
                {email}
              </span>
              <span className="block truncate text-xs text-zinc-500 dark:text-zinc-400">
                {roleLabel}
              </span>
            </span>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Active
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="mt-4 gap-2"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </Button>
        </section>

        {/* ── Preferences ── */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5 lg:col-span-2 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-2 flex items-center gap-2.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <Bell className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
                Preferences
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Fine-tune how the dashboard behaves
              </p>
            </div>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {preferences.map((pref) => (
              <div
                key={pref.id}
                className="flex items-center gap-3 py-3.5"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                  <pref.icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    {pref.label}
                  </span>
                  <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                    {pref.desc}
                  </span>
                </span>
                <Toggle
                  on={prefs[pref.id]}
                  onClick={() => togglePref(pref)}
                  label={pref.label}
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
