"use client";

import { useEffect, useRef, useState } from "react";
import { resizedImageUrl } from "@/lib/images";
import { cn } from "@/lib/utils";

interface Props {
  images: string[];
  alt: string;
  /** Width the images are fetched at; Cloudinary resizes to it. */
  width: number;
  /** Fills its parent, which sets the size (an aspect ratio, say). */
  className?: string;
  imageClassName?: string;
  /** Milliseconds each image stays on screen. */
  interval?: number;
  /** A selector for an ancestor whose hover also pauses the slideshow. */
  hoverScope?: string;
  /** Load the first image straight away, for the top of a page. */
  priority?: boolean;
}

/**
 * One image, or a slideshow of several that fades from one to the next.
 *
 * It costs nothing while off screen: only the first image loads until the
 * slideshow is seen, and it only runs while visible, not hovered, and when the
 * visitor hasn't asked for reduced motion.
 */
export function ImageCarousel({
  images,
  alt,
  width,
  className,
  imageClassName,
  interval = 3500,
  hoverScope,
  priority,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [seen, setSeen] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const many = images.length > 1;

  useEffect(() => {
    const el = ref.current;
    if (!el || !many) return;

    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
      if (entry.isIntersecting) setSeen(true);
    });
    observer.observe(el);

    const scope = (hoverScope && el.closest<HTMLElement>(hoverScope)) || el;
    const pause = () => setPaused(true);
    const resume = () => setPaused(false);
    scope.addEventListener("mouseenter", pause);
    scope.addEventListener("mouseleave", resume);

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const readMotion = () => setReducedMotion(motion.matches);
    readMotion();
    motion.addEventListener("change", readMotion);

    return () => {
      observer.disconnect();
      scope.removeEventListener("mouseenter", pause);
      scope.removeEventListener("mouseleave", resume);
      motion.removeEventListener("change", readMotion);
    };
  }, [many, hoverScope]);

  useEffect(() => {
    if (!many || !visible || paused || reducedMotion) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % images.length), interval);
    return () => window.clearInterval(timer);
  }, [many, visible, paused, reducedMotion, images.length, interval]);

  // Until it has been seen, only the first image is in the page.
  const mounted = many && seen ? images : images.slice(0, 1);

  return (
    <div ref={ref} className={cn("relative h-full w-full overflow-hidden", className)}>
      {mounted.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={resizedImageUrl(src, width)}
          alt={i === 0 ? alt : `${alt}, image ${i + 1}`}
          aria-hidden={i !== index}
          loading={priority && i === 0 ? "eager" : "lazy"}
          decoding="async"
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-in-out",
            i === index ? "opacity-100" : "opacity-0",
            imageClassName,
          )}
        />
      ))}

      {many && (
        <div className="absolute inset-x-0 bottom-2 z-20 flex justify-center gap-1.5">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              aria-label={`Show image ${i + 1} of ${images.length}`}
              aria-current={i === index}
              onClick={(e) => {
                e.preventDefault();
                setSeen(true);
                setIndex(i);
              }}
              className={cn(
                "h-1.5 rounded-full bg-white/70 shadow transition-all duration-300 hover:bg-white",
                i === index ? "w-5 bg-white" : "w-1.5",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
