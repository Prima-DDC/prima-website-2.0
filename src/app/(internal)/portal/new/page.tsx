import {
  Award,
  CalendarDays,
  FileText,
  Receipt,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireRole } from "@/features/auth/helpers";
import { DOC_CONFIG, DOC_TYPES, slugFromDocType } from "@/features/ops/config";

const ICONS: Record<string, LucideIcon> = {
  Award,
  Wallet,
  Receipt,
  CalendarDays,
  FileText,
};

export default async function NewRequestPage() {
  const profile = await requireRole();
  if (!profile.canSubmit) redirect("/portal");

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold text-navy">New request</h1>
      <p className="mt-1 text-sm text-slate-body">
        Choose the type of document you want to submit.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DOC_TYPES.map((type) => {
          const config = DOC_CONFIG[type];
          const Icon = ICONS[config.icon] ?? FileText;
          return (
            <Link
              key={type}
              href={`/portal/new/${slugFromDocType(type)}`}
              className="group rounded-lg border border-line bg-white p-6 transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl hover:shadow-brand/10"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-mist text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <h2 className="mt-4 font-bold text-navy">{config.title}</h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-body">
                {config.description}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
