"use client";

import { Download, Paperclip } from "lucide-react";
import { useState } from "react";
import { getAttachmentUrl } from "./actions";
import { formatFileSize, type Attachment } from "./attachments";

/** Read-only list of a document's attachments with signed-URL downloads. */
export function AttachmentList({
  docId,
  attachments,
}: {
  docId: string;
  attachments: Attachment[];
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const open = async (path: string) => {
    setBusy(path);
    setError(null);
    try {
      const url = await getAttachmentUrl(docId, path);
      if (url) window.open(url, "_blank", "noopener");
      else setError("Could not open that file. Please try again.");
    } catch {
      setError("Could not open that file. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mt-2">
      <ul className="space-y-2">
        {attachments.map((a) => (
          <li
            key={a.path}
            className="flex items-center justify-between gap-2 rounded-md border border-line bg-white px-3 py-2"
          >
            <span className="flex min-w-0 items-center gap-2 text-sm text-navy">
              <Paperclip className="h-4 w-4 shrink-0 text-slate-body" aria-hidden />
              <span className="truncate">{a.name}</span>
              <span className="shrink-0 text-xs text-slate-body">
                ({formatFileSize(a.size)})
              </span>
            </span>
            <button
              type="button"
              disabled={busy === a.path}
              onClick={() => open(a.path)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded border border-line px-2.5 py-1.5 text-xs font-semibold text-navy transition-colors hover:border-brand hover:text-brand disabled:opacity-60"
            >
              <Download className="h-3.5 w-3.5" aria-hidden />
              {busy === a.path ? "Preparing..." : "Download"}
            </button>
          </li>
        ))}
      </ul>
      {error ? (
        <p className="mt-2 text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
