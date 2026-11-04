"use client";

import { useEffect, useRef, useState } from "react";

const NUMBER_PATTERN = /^(\D*)(\d+(?:\.\d+)?)(.*)$/;

type CountUpProps = {
  value: string;
  duration?: number;
  className?: string;
};

/** Animates the number inside values like "50+", "3 yrs", "99%" once in view. */
export default function CountUp({
  value,
  duration = 1400,
  className = "",
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const el = ref.current;
    const match = NUMBER_PATTERN.exec(value.trim());
    if (!el || !match) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const prefix = match[1];
    const numberText = match[2];
    const suffix = match[3];
    const target = parseFloat(numberText);
    const decimals = numberText.includes(".") ? numberText.split(".")[1].length : 0;

    let raf = 0;
    let startTime = 0;

    function step(now: number) {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(`${prefix}${(target * eased).toFixed(decimals)}${suffix}`);
      if (t < 1) raf = requestAnimationFrame(step);
    }

    const observer = new IntersectionObserver((entries) => {
      if (!entries[0]?.isIntersecting) return;
      observer.disconnect();
      startTime = performance.now();
      raf = requestAnimationFrame(step);
    });
    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {display}
    </span>
  );
}