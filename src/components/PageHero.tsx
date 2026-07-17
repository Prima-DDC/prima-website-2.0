import { AnimatedBackground } from "@/components/AnimatedBackground";
import { MediaImage } from "@/components/MediaImage";

/**
 * Inner-page hero. With an image: cinematic full-bleed banner with a slow
 * zoom and navy overlay. Without: light living background.
 */
export function PageHero({
  kicker,
  title,
  intro,
  imagePath = null,
}: {
  kicker?: string;
  title: string;
  intro?: string;
  imagePath?: string | null;
}) {
  const dark = Boolean(imagePath);

  return (
    <section
      className={`relative overflow-hidden border-b border-line ${
        dark ? "bg-navy-deep" : "bg-mist/50"
      }`}
    >
      {imagePath ? (
        <>
          <MediaImage
            path={imagePath}
            alt={title}
            fill
            priority
            kenburns
            sizes="100vw"
            className="absolute inset-0"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-r from-navy-deep/95 via-navy-deep/75 to-navy-deep/35"
          />
        </>
      ) : (
        <AnimatedBackground />
      )}

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
        {kicker ? (
          <p
            className={`animate-fade-up text-sm font-semibold uppercase tracking-[0.22em] ${
              dark ? "text-brand-bright" : "text-brand"
            }`}
            style={{ animationDelay: "0.05s" }}
          >
            {kicker}
          </p>
        ) : null}
        <h1
          className={`animate-fade-up mt-4 max-w-4xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl ${
            dark ? "text-white" : "text-navy"
          }`}
          style={{ animationDelay: "0.15s" }}
        >
          {title}
        </h1>
        {intro ? (
          <p
            className={`animate-fade-up mt-6 max-w-3xl text-lg leading-relaxed ${
              dark ? "text-white/85" : "text-slate-body"
            }`}
            style={{ animationDelay: "0.3s" }}
          >
            {intro}
          </p>
        ) : null}
      </div>
    </section>
  );
}
