"use client";

import { useEffect, useState } from "react";

/**
 * Shared "which conversation is actively being viewed" signal.
 *
 * The inbox page (`MessagesClient`) is the only writer: it publishes the id of
 * the thread currently open on screen (and `null` when none is open). The
 * notification hook (`useMessageNotifications`) reads it so that a message
 * arriving on the *open* thread is auto-read and never lights up the bell,
 * while messages from any other sender/thread still count as unread.
 */
let activeLeadId: string | null = null;
let inboxMounted = 0;
let tabVisible = true;

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

/** The lead id that is actively open AND currently on screen, if any. */
function currentActiveLeadId(): string | null {
  if (inboxMounted <= 0 || !tabVisible) return null;
  return activeLeadId;
}

export function setInboxMounted(mounted: boolean) {
  inboxMounted += mounted ? 1 : -1;
  if (inboxMounted < 0) inboxMounted = 0;
  if (inboxMounted === 0) activeLeadId = null;
  emit();
}

/** Publish (or clear) the id of the conversation currently open on screen. */
export function setActiveLeadId(id: string | null) {
  if (activeLeadId === id) return;
  activeLeadId = id;
  emit();
}

/**
 * Call when the inbox page mounts. Returns a cleanup function that flips the
 * active flag back off. Also handles tab visibility so a backgrounded tab is
 * treated as "not watching".
 */
export function registerInboxActivity(): () => void {
  setInboxMounted(true);

  const onVisibility = () => {
    tabVisible = document.visibilityState === "visible";
    emit();
  };
  document.addEventListener("visibilitychange", onVisibility);

  return () => {
    document.removeEventListener("visibilitychange", onVisibility);
    setInboxMounted(false);
  };
}

/** Subscribe to activity changes (for non-React callers). */
export function subscribeInboxActivity(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getActiveLeadId(): string | null {
  return currentActiveLeadId();
}

/** True only when the given lead's thread is the one actively on screen. */
export function isLeadActive(leadId: string | null | undefined): boolean {
  if (!leadId) return false;
  return currentActiveLeadId() === leadId;
}

export function useActiveLeadId(): string | null {
  const [id, setId] = useState(currentActiveLeadId);
  useEffect(
    () => subscribeInboxActivity(() => setId(currentActiveLeadId())),
    [],
  );
  return id;
}

export function useInboxActivity(): {
  activeLeadId: string | null;
  register: () => () => void;
  setActiveLeadId: (id: string | null) => void;
} {
  const activeLeadId = useActiveLeadId();
  return {
    activeLeadId,
    register: registerInboxActivity,
    setActiveLeadId,
  };
}
