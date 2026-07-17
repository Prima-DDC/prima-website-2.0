"use client";

import { Send } from "lucide-react";
import { useActionState } from "react";
import { createTicket, type SupportState } from "./actions";
import { TICKET_CATEGORIES } from "./config";

const inputClass =
  "w-full rounded-md border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/20";

export function TicketForm() {
  const [state, formAction, pending] = useActionState<SupportState, FormData>(
    createTicket,
    { error: null },
  );

  return (
    <form action={formAction} className="rounded-lg border border-line bg-white p-7">
      {state.error ? (
        <p className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="ticket-subject" className="mb-1.5 block text-sm font-semibold text-navy">
            Subject
          </label>
          <input id="ticket-subject" name="subject" required minLength={3} maxLength={200} className={inputClass} />
        </div>
        <div>
          <label htmlFor="ticket-category" className="mb-1.5 block text-sm font-semibold text-navy">
            Category
          </label>
          <select id="ticket-category" name="category" defaultValue="profile_change" className={inputClass}>
            {TICKET_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="ticket-message" className="mb-1.5 block text-sm font-semibold text-navy">
            Describe your request
          </label>
          <textarea id="ticket-message" name="message" required minLength={5} maxLength={5000} rows={6} className={inputClass} />
        </div>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="mt-6 inline-flex items-center gap-2 rounded bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Send className="h-4 w-4" aria-hidden />
        {pending ? "Submitting..." : "Submit ticket"}
      </button>
    </form>
  );
}
