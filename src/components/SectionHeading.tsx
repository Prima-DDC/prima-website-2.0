export function SectionHeading({
  kicker,
  title,
  intro,
  light = false,
}: {
  kicker?: string;
  title: string;
  intro?: string;
  light?: boolean;
}) {
  return (
    <div className="max-w-3xl">
      {kicker ? (
        <p
          className={`mb-3 text-sm font-semibold uppercase tracking-[0.18em] ${
            light ? "text-brand-bright" : "text-brand"
          }`}
        >
          {kicker}
        </p>
      ) : null}
      <h2
        className={`text-3xl font-bold leading-tight sm:text-4xl ${
          light ? "text-white" : "text-navy"
        }`}
      >
        {title}
      </h2>
      {intro ? (
        <p
          className={`mt-4 text-lg leading-relaxed ${
            light ? "text-white/80" : "text-slate-body"
          }`}
        >
          {intro}
        </p>
      ) : null}
    </div>
  );
}
