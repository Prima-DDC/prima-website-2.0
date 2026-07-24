"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { MediaImage } from "@/components/MediaImage";
import type { GalleryImage } from "@/features/content/types";

/**
 * Accessible image carousel built on a native scroll-snap track, so touch and
 * trackpad dragging work for free. Arrows and dots drive it on desktop; it
 * auto-advances unless the viewer prefers reduced motion or is interacting.
 */
export function ImageCarousel({
  images,
  label,
}: {
  images: GalleryImage[];
  label: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = images.length;

  const goTo = useCallback((i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = ((i % count) + count) % count;
    track.scrollTo({ left: track.clientWidth * clamped, behavior: "smooth" });
  }, [count]);

  // Keep the active dot in sync with manual scrolling / dragging.
  const onScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    setIndex(Math.round(track.scrollLeft / track.clientWidth));
  };

  // Auto-advance, disabled under reduced motion or while the user interacts.
  useEffect(() => {
    if (count < 2 || paused) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const id = setInterval(() => goTo(index + 1), 5000);
    return () => clearInterval(id);
  }, [count, paused, index, goTo]);

  if (count === 0) return null;

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label={label}
      className="relative overflow-hidden rounded-xl border border-line bg-navy-deep"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") { e.preventDefault(); goTo(index - 1); }
        if (e.key === "ArrowRight") { e.preventDefault(); goTo(index + 1); }
      }}
      tabIndex={0}
    >
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((img, i) => (
          <div key={img.path} className="relative w-full shrink-0 snap-center">
            <MediaImage
              path={img.path}
              alt={img.caption}
              fill={false}
              width={1280}
              height={720}
              sizes="(max-width: 1024px) 100vw, 900px"
              priority={i === 0}
              className="aspect-[16/9] w-full"
              imgClassName="h-full w-full"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-navy-deep/90 to-transparent"
            />
            <p className="absolute inset-x-0 bottom-0 px-5 pb-9 pt-4 text-sm font-semibold text-white sm:text-base">
              {img.caption}
            </p>
          </div>
        ))}
      </div>

      <p className="sr-only" aria-live="polite">
        {`Image ${index + 1} of ${count}: ${images[index]?.caption ?? ""}`}
      </p>

      {count > 1 ? (
        <>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Previous image"
            className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-navy shadow-lg backdrop-blur transition-colors hover:bg-white"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Next image"
            className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-navy shadow-lg backdrop-blur transition-colors hover:bg-white"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>

          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2">
            {images.map((img, i) => (
              <button
                key={img.path}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to image ${i + 1}`}
                aria-current={i === index}
                className={`h-2 rounded-full transition-all ${
                  i === index ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
