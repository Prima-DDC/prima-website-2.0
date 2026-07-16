import { CountUp } from "@/components/CountUp";
import { Reveal } from "@/components/Reveal";
import type { StatItem } from "../types";

export function StatBar({ items }: { items: StatItem[] }) {
  return (
    <section className="border-y border-line bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-line lg:grid-cols-4">
        {items.map((stat, i) => (
          <Reveal
            key={stat.label}
            delay={i * 100}
            className="px-6 py-10 text-center sm:py-12"
          >
            <CountUp
              value={stat.value}
              className="font-serif text-4xl font-bold text-brand sm:text-5xl"
            />
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-body sm:text-sm">
              {stat.label}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
