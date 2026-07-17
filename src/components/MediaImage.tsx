"use client";

import Image from "next/image";
import { useState } from "react";
import { mediaUrl } from "@/lib/media";

/**
 * Supabase Storage image with a shimmer skeleton while loading and a
 * smooth fade + settle-in reveal. `kenburns` adds a slow cinematic zoom
 * (for full-bleed banners); `hoverZoom` scales on card hover.
 */
export function MediaImage({
  path,
  alt,
  fill = false,
  width,
  height,
  sizes,
  priority = false,
  kenburns = false,
  hoverZoom = false,
  className = "",
  imgClassName = "",
}: {
  path: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  kenburns?: boolean;
  hoverZoom?: boolean;
  className?: string;
  imgClassName?: string;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={`overflow-hidden ${fill ? "" : "relative"} ${className}`}
    >
      {!loaded ? <div className="skeleton absolute inset-0" aria-hidden /> : null}
      <Image
        src={mediaUrl(path)}
        alt={alt}
        fill={fill}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        sizes={sizes}
        priority={priority}
        onLoad={() => setLoaded(true)}
        className={`object-cover transition-[opacity,transform,filter] duration-700 ease-out ${
          loaded ? "opacity-100 blur-0 scale-100" : "opacity-0 blur-md scale-105"
        } ${loaded && kenburns ? "animate-kenburns" : ""} ${
          hoverZoom ? "group-hover:scale-105" : ""
        } ${imgClassName}`}
      />
    </div>
  );
}
