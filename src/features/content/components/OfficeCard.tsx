import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { Office, OfficeContent } from "../types";

export function OfficeCard({
  office,
  content,
}: {
  office: Office;
  content: OfficeContent;
}) {
  return (
    <div className="group h-full rounded-lg border border-line bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl hover:shadow-brand/10">
      <h3 className="text-lg font-bold text-navy">{content.name}</h3>
      <p className="mt-3 flex items-start gap-2 text-sm text-slate-body">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden />
        <span>{content.addressLines.join(", ")}</span>
      </p>
      <div className="mt-5 space-y-2 border-t border-line pt-5 text-sm">
        <a
          href={`tel:${office.phone.replace(/\s/g, "")}`}
          className="flex items-center gap-2 text-navy hover:text-brand"
        >
          <Phone className="h-4 w-4 text-brand" aria-hidden />
          {office.phone}
        </a>
        <a
          href={`mailto:${office.email}`}
          className="flex items-center gap-2 text-navy hover:text-brand"
        >
          <Mail className="h-4 w-4 text-brand" aria-hidden />
          {office.email}
        </a>
        {office.whatsapp ? (
          <a
            href={`https://wa.me/${office.whatsapp.replace(/[^\d]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-navy hover:text-brand"
          >
            <MessageCircle className="h-4 w-4 text-brand" aria-hidden />
            WhatsApp
          </a>
        ) : null}
      </div>
    </div>
  );
}
