import { ArrowRight } from "lucide-react";
import { MediaImage } from "@/components/MediaImage";
import { ServiceIcon } from "@/components/ServiceIcon";
import { Link } from "@/i18n/navigation";

export function ServiceCard({
  slug,
  icon,
  imagePath,
  index,
  title,
  tagline,
  cta,
}: {
  slug: string;
  icon: string;
  imagePath: string | null;
  index: number;
  title: string;
  tagline: string;
  cta: string;
}) {
  return (
    <Link
      href={`/practice-areas/${slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-line bg-white transition-all duration-300 hover:-translate-y-1.5 hover:border-brand/40 hover:shadow-xl hover:shadow-brand/10"
    >
      {imagePath ? (
        <div className="relative">
          <MediaImage
            path={imagePath}
            alt={title}
            width={640}
            height={360}
            hoverZoom
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
            className="aspect-video"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-navy-deep/70 via-transparent to-transparent"
          />
          <span
            aria-hidden
            className="absolute bottom-3 right-4 font-serif text-4xl font-bold text-white/80"
          >
            {String(index).padStart(2, "0")}
          </span>
          <span className="absolute bottom-3 left-4 flex h-10 w-10 items-center justify-center rounded-md bg-brand text-white shadow-lg shadow-navy/30">
            <ServiceIcon name={icon} className="h-5 w-5" />
          </span>
        </div>
      ) : (
        <span
          aria-hidden
          className="absolute -right-3 -top-5 font-serif text-7xl font-bold text-mist transition-colors group-hover:text-brand/10"
        >
          {String(index).padStart(2, "0")}
        </span>
      )}
      <div className="relative flex flex-1 flex-col p-6">
        {!imagePath ? (
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-mist text-brand transition-colors group-hover:bg-brand group-hover:text-white">
            <ServiceIcon name={icon} className="h-5 w-5" />
          </div>
        ) : null}
        <h3 className={`text-lg font-bold leading-snug text-navy ${imagePath ? "" : "mt-5"}`}>
          {title}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-body">
          {tagline}
        </p>
        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
          {cta}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
