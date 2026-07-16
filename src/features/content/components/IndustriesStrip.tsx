import { Reveal } from "@/components/Reveal";
import { ServiceIcon } from "@/components/ServiceIcon";
import { Link } from "@/i18n/navigation";

export interface IndustryStripItem {
  slug: string;
  icon: string;
  title: string;
}

export function IndustriesStrip({ items }: { items: IndustryStripItem[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((industry, i) => (
        <Reveal key={industry.slug} delay={(i % 3) * 100}>
          <Link
            href={`/industries#${industry.slug}`}
            className="group flex items-center gap-4 rounded-md border border-line bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg hover:shadow-brand/10"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-mist text-brand transition-colors group-hover:bg-brand group-hover:text-white">
              <ServiceIcon name={industry.icon} className="h-5 w-5" />
            </span>
            <span className="text-sm font-semibold leading-snug text-navy group-hover:text-brand-dark">
              {industry.title}
            </span>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
