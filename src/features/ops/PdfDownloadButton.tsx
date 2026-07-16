"use client";

import { FileDown } from "lucide-react";
import { useState } from "react";
import { getPdfUrl } from "./actions";

export function PdfDownloadButton({ docId }: { docId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  return (
    <button
      type="button"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        setError(false);
        try {
          const url = await getPdfUrl(docId);
          if (url) window.open(url, "_blank", "noopener");
          else setError(true);
        } catch {
          setError(true);
        } finally {
          setLoading(false);
        }
      }}
      className="inline-flex items-center gap-2 rounded bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
    >
      <FileDown className="h-4 w-4" aria-hidden />
      {loading ? "Preparing..." : error ? "Try again" : "Download PDF"}
    </button>
  );
}
