import { CountUp } from "@/components/CountUp";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import type { ClientsStatsBlock } from "../types";

/** Kroll-style client stats grid: bold serif numerals with emphasized labels. */
export function ClientsStats({ block }: { block: ClientsStatsBlock }) {
  return (
    <section className="relative overflow-hidden bg-mist">
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
        <Reveal>
          <SectionHeading
            kicker={block.kicker}
            title={block.title}
            intro={block.intro}
          />
        </Reveal>
        <div className="mt-14 grid gap-x-12 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {block.items.map((item, i) => (
            <Reveal key={item.description} delay={(i % 3) * 120}>
              <div className="flex flex-wrap items-baseline gap-x-3">
                <CountUp
                  value={item.value}
                  className={`font-serif text-5xl font-bold sm:text-6xl ${
                    i % 2 === 0 ? "text-brand" : "text-navy"
                  }`}
                />
                {item.connector ? (
                  <span className="text-sm text-slate-body">{item.connector}</span>
                ) : null}
              </div>
              <p className="mt-3 max-w-xs text-base font-semibold leading-snug text-navy">
                {item.description}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
