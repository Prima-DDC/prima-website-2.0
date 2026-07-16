"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Animates the numeric part of values like "4,300+", "95%", "3" when the
 * element scrolls into view, preserving prefix/suffix and thousands separator.
 */
export function CountUp({
  value,
  className,
  duration = 1600,
}: {
  value: string;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const match = value.match(/([\d][\d.,\s ]*)/);
    if (!match) return;
    const raw = match[1];
    const target = parseFloat(raw.replace(/[^\d.]/g, ""));
    if (!Number.isFinite(target)) return;
    const separator = raw.includes(",") ? "," : raw.includes(".") && target >= 1000 ? "." : "";
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const format = (n: number) => {
      const rounded = Math.round(n);
      const text = separator
        ? rounded.toLocaleString("en-US").replace(/,/g, separator)
        : String(rounded);
      return value.replace(raw, text);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(format(target * eased));
          if (progress < 1) requestAnimationFrame(tick);
          else setDisplay(value);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
