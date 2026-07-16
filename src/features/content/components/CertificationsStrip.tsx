import { Award, BadgeCheck, Lock, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import type { Certification, CertificationsBlock } from "../types";

const CERT_ICONS = [Award, BadgeCheck, Lock, ShieldCheck];

export function CertificationsStrip({
  block,
  certifications,
}: {
  block: CertificationsBlock;
  certifications: Certification[];
}) {
  return (
    <section className="border-y border-line bg-mist/60">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">
            {block.kicker}
          </p>
          <p className="mt-2 max-w-2xl text-base text-slate-body">{block.intro}</p>
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {certifications.map((cert, i) => {
            const Icon = CERT_ICONS[i % CERT_ICONS.length];
            return (
              <Reveal key={cert.title} delay={i * 100}>
                <div className="flex h-full items-start gap-3 rounded-md border border-line/70 bg-white/80 p-4 backdrop-blur transition-colors hover:border-brand/40">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden />
                  <div>
                    <h3 className="text-sm font-bold text-navy">{cert.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-body">
                      {cert.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
