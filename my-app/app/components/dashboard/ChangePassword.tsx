"use client";

import { useState, type FormEvent } from "react";
import { Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { inputCls, labelCls } from "@/components/ui/shared";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const MIN_LENGTH = 8;
const MAX_LENGTH = 128;

const FIELDS = [
  { key: "current", label: "Current password", autoComplete: "current-password" },
  { key: "next", label: "New password", autoComplete: "new-password" },
  { key: "confirm", label: "Confirm new password", autoComplete: "new-password" },
] as const;

type Values = Record<(typeof FIELDS)[number]["key"], string>;
const EMPTY: Values = { current: "", next: "", confirm: "" };

function validate(values: Values): Partial<Values> {
  const errors: Partial<Values> = {};
  if (!values.current) errors.current = "Enter your current password.";
  if (values.next.length < MIN_LENGTH) {
    errors.next = `Use at least ${MIN_LENGTH} characters.`;
  } else if (values.next.length > MAX_LENGTH) {
    errors.next = `Use at most ${MAX_LENGTH} characters.`;
  } else if (values.next === values.current) {
    errors.next = "Choose a password different from the current one.";
  }
  if (values.confirm !== values.next) errors.confirm = "The passwords do not match.";
  return errors;
}

/**
 * Lets the signed-in user change their own password. It sits in the top bar as
 * well as Settings because Settings can be closed to a role, and everyone must
 * be able to replace a temporary password.
 */
export function ChangePassword({ iconOnly = false }: { iconOnly?: boolean }) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<Partial<Values>>({});
  const [visible, setVisible] = useState(false);
  const [pending, setPending] = useState(false);

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setValues(EMPTY);
      setErrors({});
      setVisible(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setPending(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: values.current,
          newPassword: values.next,
        }),
      });
      const body = (await res.json().catch(() => null)) as { message?: string } | null;

      if (res.status === 401) {
        window.location.replace("/login");
        return;
      }
      if (!res.ok) {
        toast.error(body?.message ?? "Could not change your password.");
        return;
      }
      toast.success("Password changed. Other devices were signed out.");
      onOpenChange(false);
    } catch {
      toast.error("Cannot reach the server. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      {iconOnly ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Change password"
          title="Change password"
          className="grid h-9 w-9 place-items-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
        >
          <KeyRound className="h-4 w-4" />
        </button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
          className="gap-2"
        >
          <KeyRound className="h-3.5 w-3.5" />
          Change password
        </Button>
      )}

      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="flex w-full flex-col gap-0 sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Change password</SheetTitle>
            <SheetDescription>
              You stay signed in here. Other devices will be signed out.
            </SheetDescription>
          </SheetHeader>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4"
          >
            {FIELDS.map(({ key, label, autoComplete }) => (
              <div key={key} className="flex flex-col gap-1.5">
                <label htmlFor={`password-${key}`} className={labelCls}>
                  {label}
                </label>
                <input
                  id={`password-${key}`}
                  type={visible ? "text" : "password"}
                  autoComplete={autoComplete}
                  value={values[key]}
                  aria-invalid={Boolean(errors[key])}
                  aria-describedby={errors[key] ? `password-${key}-error` : undefined}
                  onChange={(e) => {
                    setValues((prev) => ({ ...prev, [key]: e.target.value }));
                    setErrors((prev) => ({ ...prev, [key]: undefined }));
                  }}
                  className={inputCls}
                />
                {errors[key] && (
                  <p id={`password-${key}-error`} className="text-xs text-red-500">
                    {errors[key]}
                  </p>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              aria-pressed={visible}
              className="flex w-fit items-center gap-1.5 rounded-lg text-xs font-medium text-zinc-500 transition-colors hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400"
            >
              {visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {visible ? "Hide passwords" : "Show passwords"}
            </button>

            <Button
              type="submit"
              disabled={pending}
              className="mt-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
            >
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {pending ? "Saving..." : "Change password"}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
