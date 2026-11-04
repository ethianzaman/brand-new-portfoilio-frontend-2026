"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  /** Stagger in ms. Keep it small: it also delays above-the-fold content. */
  delay?: number;
  className?: string;
};

const onVisible = new WeakMap<Element, () => void>();
let sharedObserver: IntersectionObserver | null = null;

function observeOnce(el: Element, callback: () => void) {
  sharedObserver ??= new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      sharedObserver?.unobserve(entry.target);
      onVisible.get(entry.target)?.();
      onVisible.delete(entry.target);
    }
  });

  onVisible.set(el, callback);
  sharedObserver.observe(el);

  return () => {
    onVisible.delete(el);
    sharedObserver?.unobserve(el);
  };
}

/**
 * Marks the element `done` once its own animation ends. Uses `getAnimations()`
 * because server-rendered content can finish animating before hydration, when
 * an `animationend` listener would never fire.
 */
function markDoneWhenSettled(el: HTMLElement) {
  Promise.all(el.getAnimations().map((animation) => animation.finished)).then(
    () => {
      el.dataset.reveal = "done";
    },
    () => {},
  );
}

/**
 * The entrance animation for every public section.
 *
 * Content on screen at load fades up straight away; content further down waits
 * until it is scrolled to. Everything is visible in the server render, without
 * JS, and with reduced motion.
 *
 * Phases are written to `data-reveal` rather than React state so a page full of
 * cards never re-renders to animate. Styles live in `globals.css` (`.reveal`).
 * The `done` phase drops the transform, which would otherwise trap `fixed`
 * children and stack z-indexed dropdowns under later sections.
 */
export default function Reveal({ children, delay = 0, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (!el.dataset.reveal) {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        el.dataset.reveal = "done";
      } else if (el.getBoundingClientRect().top >= window.innerHeight * 0.9) {
        el.dataset.reveal = "hidden";
      } else {
        markDoneWhenSettled(el);
      }
    }

    if (el.dataset.reveal !== "hidden") return;
    return observeOnce(el, () => {
      el.dataset.reveal = "shown";
      markDoneWhenSettled(el);
    });
  }, []);

  return (
    <div
      ref={ref}
      style={delay ? ({ "--reveal-delay": `${delay}ms` } as CSSProperties) : undefined}
      className={cn("reveal", className)}
    >
      {children}
    </div>
  );
}
