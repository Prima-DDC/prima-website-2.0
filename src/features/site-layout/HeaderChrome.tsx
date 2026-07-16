"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Liquid-glass header shell: translucent blur that deepens and gains a
 * brand-tinted shadow once the page scrolls, plus a scroll progress bar.
 */
export function HeaderChrome({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(window.scrollY / max, 1) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`glass sticky top-0 z-40 transition-all duration-500 ${
        scrolled ? "glass-scrolled" : ""
      }`}
    >
      {children}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-gradient-to-r from-brand via-brand-bright to-navy transition-transform duration-150"
        style={{ transform: `scaleX(${progress})` }}
      />
    </header>
  );
}
