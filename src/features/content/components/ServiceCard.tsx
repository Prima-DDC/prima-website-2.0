import { ArrowRight } from "lucide-react";
import { ServiceIcon } from "@/components/ServiceIcon";
import { Link } from "@/i18n/navigation";

export function ServiceCard({
  slug,
  icon,
  index,
  title,
  tagline,
  cta,
}: {
  slug: string;
  icon: string;
  index: number;
  title: string;
  tagline: string;
  cta: string;
}) {
  return (
    <Link
      href={`/practice-areas/${slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-line bg-white p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-brand/40 hover:shadow-xl hover:shadow-brand/10"
    >
      <span
        aria-hidden
        className="absolute -right-3 -top-5 font-serif text-7xl font-bold text-mist transition-colors group-hover:text-brand/10"
      >
        {String(index).padStart(2, "0")}
      </span>
      <div className="relative flex h-11 w-11 items-center justify-center rounded-md bg-mist text-brand transition-colors group-hover:bg-brand group-hover:text-white">
        <ServiceIcon name={icon} className="h-5 w-5" />
      </div>
      <h3 className="relative mt-5 text-lg font-bold leading-snug text-navy">
        {title}
      </h3>
      <p className="relative mt-2 flex-1 text-sm leading-relaxed text-slate-body">
        {tagline}
      </p>
      <span className="relative mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
        {cta}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
