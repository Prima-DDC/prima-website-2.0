import { Scale, Calculator, Radar, FlaskConical } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import type { CredentialsBlock } from "../types";

const CLUSTER_ICONS = [Scale, Calculator, Radar, FlaskConical];

export function CredentialClusters({ block }: { block: CredentialsBlock }) {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
        <Reveal>
          <SectionHeading
            kicker={block.kicker}
            title={block.title}
            intro={block.framing}
          />
        </Reveal>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {block.clusters.map((cluster, i) => {
            const Icon = CLUSTER_ICONS[i % CLUSTER_ICONS.length];
            return (
              <Reveal key={cluster.title} delay={i * 120}>
                <div className="group h-full rounded-lg border border-line bg-white p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-brand/40 hover:shadow-xl hover:shadow-brand/10">
                  <div className="flex h-11 w-11 items-center justify-center rounded-md bg-mist text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-navy">
                    {cluster.title}
                  </h3>
                  <p className="mt-2 text-sm font-medium text-brand-dark">
                    {cluster.credentials}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-body">
                    {cluster.powers}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
