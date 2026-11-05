"use client";

import { useRef, type ReactNode } from "react";

/**
 * Card with a cursor-following glow and a subtle 3D tilt.
 * Pure CSS variables, no animation library.
 */
export default function SpotlightCard({
  children,
  className = "",
  contentClassName = "",
}: {
  children: ReactNode;
  className?: string;
  /** For a card that lays out its children, such as a flex column. */
  contentClassName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    el.style.setProperty("--mx", `${x}px`);
    el.style.setProperty("--my", `${y}px`);
    el.style.setProperty("--rx", `${((y / r.height) - 0.5) * -6}deg`);
    el.style.setProperty("--ry", `${((x / r.width) - 0.5) * 6}deg`);
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`spotlight-card group relative overflow-hidden ${className}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(260px circle at var(--mx, 50%) var(--my, 50%), rgba(99,102,241,0.16), transparent 70%)",
        }}
      />
      <div className={`relative ${contentClassName}`}>{children}</div>
    </div>
  );
}
