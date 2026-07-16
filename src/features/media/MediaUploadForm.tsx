"use client";

import { Upload } from "lucide-react";
import { useActionState } from "react";
import { uploadMedia, type MediaState } from "./actions";

const initialState: MediaState = { error: null };

export function MediaUploadForm() {
  const [state, formAction, pending] = useActionState(uploadMedia, initialState);

  return (
    <form
      action={formAction}
      className="flex flex-wrap items-center gap-3 rounded-lg border border-dashed border-line bg-white p-5"
    >
      <input
        type="file"
        name="file"
        required
        accept="image/*,.pdf"
        className="text-sm text-slate-body file:mr-3 file:rounded file:border-0 file:bg-mist file:px-4 file:py-2 file:text-sm file:font-semibold file:text-navy hover:file:bg-line/60"
      />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Upload className="h-4 w-4" aria-hidden />
        {pending ? "Uploading..." : "Upload"}
      </button>
      {state.error ? (
        <p className="text-xs text-red-600" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="text-xs font-semibold text-brand" role="status">
          {state.success}
        </p>
      ) : null}
    </form>
  );
}
