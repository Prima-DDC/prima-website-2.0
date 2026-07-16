import { ChevronDown } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import type { FaqBlock } from "../types";

/** Native details/summary accordion: accessible, zero JS. */
export function FaqAccordion({ block }: { block: FaqBlock }) {
  return (
    <div>
      <h2 className="text-3xl font-bold text-navy sm:text-4xl">{block.title}</h2>
      <div className="mt-8 space-y-3">
        {block.items.map((item, i) => (
          <Reveal key={item.question} delay={i * 80}>
            <details className="group rounded-lg border border-line bg-white open:border-brand/40 open:shadow-lg open:shadow-brand/5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-base font-semibold text-navy [&::-webkit-details-marker]:hidden">
                {item.question}
                <ChevronDown
                  className="h-5 w-5 shrink-0 text-brand transition-transform group-open:rotate-180"
                  aria-hidden
                />
              </summary>
              <p className="px-6 pb-6 leading-relaxed text-slate-body">
                {item.answer}
              </p>
            </details>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
