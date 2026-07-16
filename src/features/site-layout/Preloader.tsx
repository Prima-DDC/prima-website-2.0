"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

/**
 * Branded first-visit preloader: pulsing logo inside expanding brand rings
 * with a shimmer progress line. Shows once per browser session, then fades.
 */
export function Preloader({ note }: { note: string }) {
  const [state, setState] = useState<"idle" | "showing" | "leaving" | "done">(
    "idle",
  );

  useEffect(() => {
    if (sessionStorage.getItem("prima-preloaded")) return;
    const show = setTimeout(() => setState("showing"), 0);
    const leave = setTimeout(() => {
      setState("leaving");
      sessionStorage.setItem("prima-preloaded", "1");
    }, 1400);
    const done = setTimeout(() => setState("done"), 2000);
    return () => {
      clearTimeout(show);
      clearTimeout(leave);
      clearTimeout(done);
    };
  }, []);

  if (state === "idle" || state === "done") return null;

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white transition-opacity duration-500 ${
        state === "leaving" ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="relative flex h-32 w-32 items-center justify-center">
        <span className="absolute inset-0 rounded-full border-2 border-brand/40 animate-pulse-ring" />
        <span
          className="absolute inset-2 rounded-full border-2 border-navy/25 animate-pulse-ring"
          style={{ animationDelay: "0.5s" }}
        />
        <Image
          src="/logo.png"
          alt=""
          width={96}
          height={96}
          priority
          className="h-24 w-24 animate-float object-contain"
        />
      </div>
      <div className="mt-6 h-1 w-44 overflow-hidden rounded-full bg-mist">
        <div
          className="h-full w-full rounded-full animate-shimmer"
          style={{
            background:
              "linear-gradient(90deg, transparent, #018f55 40%, #5cb531 60%, transparent)",
            backgroundSize: "200% 100%",
          }}
        />
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-slate-body">
        {note}
      </p>
    </div>
  );
}
