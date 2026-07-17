"use client";

import { Send } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";
import { replyTicket, type SupportState } from "./actions";

export function ReplyForm({ ticketId }: { ticketId: string }) {
  const [state, formAction, pending] = useActionState<SupportState, FormData>(
    replyTicket,
    { error: null },
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && !state.error) formRef.current?.reset();
  }, [pending, state.error]);

  return (
    <form ref={formRef} action={formAction} className="mt-5">
      {state.error ? (
        <p className="mb-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      <input type="hidden" name="ticketId" value={ticketId} />
      <textarea
        name="body"
        required
        maxLength={5000}
        rows={3}
        placeholder="Write a reply..."
        className="w-full rounded-md border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/20"
      />
      <button
        type="submit"
        disabled={pending}
        className="mt-3 inline-flex items-center gap-2 rounded bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Send className="h-4 w-4" aria-hidden />
        {pending ? "Sending..." : "Reply"}
      </button>
    </form>
  );
}
