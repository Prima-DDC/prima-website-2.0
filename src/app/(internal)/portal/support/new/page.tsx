import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { TicketForm } from "@/features/support/TicketForm";

export default function NewTicketPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/portal/support"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-dark"
      >
        <ArrowLeft className="h-4 w-4" /> Support
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-navy">New support ticket</h1>
      <p className="mt-1 text-sm text-slate-body">
        Administration is notified immediately and replies right here.
      </p>
      <div className="mt-8">
        <TicketForm />
      </div>
    </div>
  );
}
