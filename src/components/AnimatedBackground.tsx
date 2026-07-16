/**
 * Living background: slow-drifting aurora blobs in brand colors over an
 * animated fine grid. Pure CSS, GPU-friendly, disabled by reduced motion.
 */
export function AnimatedBackground({
  variant = "light",
}: {
  variant?: "light" | "dark";
}) {
  const dark = variant === "dark";
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${
        dark ? "bg-live-grid-dark" : "bg-live-grid"
      }`}
    >
      <div
        className={`absolute -left-24 -top-32 h-[28rem] w-[28rem] rounded-full blur-3xl animate-aurora-a ${
          dark ? "bg-brand/25" : "bg-brand/10"
        }`}
      />
      <div
        className={`absolute right-[-10%] top-1/4 h-[24rem] w-[32rem] rounded-full blur-3xl animate-aurora-b ${
          dark ? "bg-brand-bright/15" : "bg-navy/10"
        }`}
      />
      <div
        className={`absolute bottom-[-20%] left-1/3 h-[22rem] w-[26rem] rounded-full blur-3xl animate-aurora-c ${
          dark ? "bg-navy/60" : "bg-brand-bright/10"
        }`}
      />
    </div>
  );
}
