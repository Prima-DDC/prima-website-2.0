import { AnimatedBackground } from "@/components/AnimatedBackground";

/** Inner-page hero: kicker + title + optional intro over a living background. */
export function PageHero({
  kicker,
  title,
  intro,
}: {
  kicker?: string;
  title: string;
  intro?: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-mist/50">
      <AnimatedBackground />
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
        {kicker ? (
          <p
            className="animate-fade-up text-sm font-semibold uppercase tracking-[0.22em] text-brand"
            style={{ animationDelay: "0.05s" }}
          >
            {kicker}
          </p>
        ) : null}
        <h1
          className="animate-fade-up mt-4 max-w-4xl text-4xl font-bold leading-[1.1] tracking-tight text-navy sm:text-5xl"
          style={{ animationDelay: "0.15s" }}
        >
          {title}
        </h1>
        {intro ? (
          <p
            className="animate-fade-up mt-6 max-w-3xl text-lg leading-relaxed text-slate-body"
            style={{ animationDelay: "0.3s" }}
          >
            {intro}
          </p>
        ) : null}
      </div>
    </section>
  );
}
