import { Reveal } from "@/components/Reveal";
import type { LinkedItem } from "../types";

export function LinkedItemGrid({
  items,
  columns = 4,
}: {
  items: LinkedItem[];
  columns?: 2 | 3 | 4;
}) {
  const cols =
    columns === 2
      ? "sm:grid-cols-2"
      : columns === 3
        ? "sm:grid-cols-2 lg:grid-cols-3"
        : "sm:grid-cols-2 lg:grid-cols-4";
  return (
    <div className={`grid gap-8 ${cols}`}>
      {items.map((item, i) => (
        <Reveal key={item.title} delay={i * 100}>
          <div className="h-full border-t-2 border-brand pt-5">
            <h3 className="text-lg font-bold text-navy">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-body">
              {item.body}
            </p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
