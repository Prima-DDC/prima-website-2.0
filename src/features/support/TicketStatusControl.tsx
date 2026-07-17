"use client";

import { Save } from "lucide-react";
import { useActionState } from "react";
import { updateTicketStatus, type SupportState } from "./actions";

export function TicketStatusControl({
  ticketId,
  status,
}: {
  ticketId: string;
  status: string;
}) {
  const [state, formAction, pending] = useActionState<SupportState, FormData>(
    updateTicketStatus,
    { error: null },
  );

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="ticketId" value={ticketId} />
      <select
        name="status"
        defaultValue={status}
        className="rounded-md border border-line bg-white px-3 py-2 text-sm font-medium text-navy outline-none focus:border-brand"
      >
        <option value="open">Open</option>
        <option value="in_progress">In progress</option>
        <option value="resolved">Resolved</option>
        <option value="closed">Closed</option>
      </select>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded border border-line px-3 py-2 text-sm font-semibold text-navy transition-colors hover:border-brand hover:text-brand disabled:opacity-50"
      >
        <Save className="h-4 w-4" aria-hidden />
        {pending ? "Saving..." : "Update"}
      </button>
      {state.error ? (
        <span className="text-xs text-red-600" role="alert">
          {state.error}
        </span>
      ) : null}
    </form>
  );
}
