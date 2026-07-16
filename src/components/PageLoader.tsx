import Image from "next/image";

/** Full-page route loading state with a per-page localized note. */
export function PageLoader({ note }: { note: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center py-24">
      <div className="relative flex h-24 w-24 items-center justify-center">
        <span className="absolute inset-0 rounded-full border-2 border-brand/30 animate-pulse-ring" />
        <Image
          src="/logo.png"
          alt=""
          width={64}
          height={64}
          className="h-16 w-16 animate-float object-contain"
        />
      </div>
      <div className="mt-5 h-1 w-36 overflow-hidden rounded-full bg-mist">
        <div
          className="h-full w-full rounded-full animate-shimmer"
          style={{
            background:
              "linear-gradient(90deg, transparent, #018f55 40%, #5cb531 60%, transparent)",
            backgroundSize: "200% 100%",
          }}
        />
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.25em] text-slate-body">
        {note}
      </p>
    </div>
  );
}
