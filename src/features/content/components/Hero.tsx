import { ArrowRight } from "lucide-react";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { MediaImage } from "@/components/MediaImage";
import { Link } from "@/i18n/navigation";
import type { HeroBlock } from "../types";

export function Hero({
  block,
  imagePath,
}: {
  block: HeroBlock;
  imagePath: string | null;
}) {
  const dark = Boolean(imagePath);

  return (
    <section
      className={`relative overflow-hidden ${dark ? "bg-navy-deep" : "bg-white"}`}
    >
      {imagePath ? (
        <>
          <MediaImage
            path={imagePath}
            alt={block.title}
            fill
            priority
            kenburns
            sizes="100vw"
            className="absolute inset-0"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-r from-navy-deep/95 via-navy-deep/80 to-navy-deep/40"
          />
          <div aria-hidden className="bg-live-grid-dark absolute inset-0 opacity-60" />
        </>
      ) : (
        <AnimatedBackground />
      )}

      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:py-40">
        <p
          className={`animate-fade-up text-sm font-semibold uppercase tracking-[0.22em] ${
            dark ? "text-brand-bright" : "text-brand"
          }`}
          style={{ animationDelay: "0.05s" }}
        >
          {block.kicker}
        </p>
        <h1
          className={`animate-fade-up mt-5 max-w-4xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl ${
            dark ? "text-white" : "text-navy"
          }`}
          style={{ animationDelay: "0.15s" }}
        >
          {block.title}
        </h1>
        <p
          className={`animate-fade-up mt-6 max-w-2xl text-lg leading-relaxed sm:text-xl ${
            dark ? "text-white/85" : "text-slate-body"
          }`}
          style={{ animationDelay: "0.3s" }}
        >
          {block.subtitle}
        </p>
        <div
          className="animate-fade-up mt-10 flex flex-wrap gap-4"
          style={{ animationDelay: "0.45s" }}
        >
          <Link
            href="/contact"
            className="group inline-flex items-center gap-2 rounded bg-brand px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition-all hover:-translate-y-0.5 hover:bg-brand-dark hover:shadow-xl hover:shadow-brand/30"
          >
            {block.ctaPrimary}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/practice-areas"
            className={`inline-flex items-center gap-2 rounded border px-6 py-3.5 text-sm font-semibold backdrop-blur transition-all hover:-translate-y-0.5 ${
              dark
                ? "border-white/30 bg-white/10 text-white hover:border-white hover:bg-white/20"
                : "border-navy/20 bg-white/70 text-navy hover:border-navy hover:bg-white"
            }`}
          >
            {block.ctaSecondary}
          </Link>
        </div>
      </div>
    </section>
  );
}
