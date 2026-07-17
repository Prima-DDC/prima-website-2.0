"use client";

import { Trash2 } from "lucide-react";
import { useActionState } from "react";
import { ConfirmButton } from "@/components/ConfirmDialog";
import { deleteOpsDocument, type OpsState } from "./actions";

export function DeleteDocButton({
  docId,
  docNumber,
}: {
  docId: string;
  docNumber: string;
}) {
  const [state, formAction, pending] = useActionState<OpsState, FormData>(
    deleteOpsDocument,
    { error: null },
  );

  return (
    <form action={formAction} className="inline">
      <input type="hidden" name="docId" value={docId} />
      <ConfirmButton
        dialog={{
          tone: "danger",
          title: `Delete ${docNumber}?`,
          message:
            "The document, its approval trail, its history, and any generated PDF are permanently removed. This cannot be undone.",
          confirmLabel: "Delete document",
        }}
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" aria-hidden />
        {pending ? "Deleting..." : "Delete"}
      </ConfirmButton>
      {state.error ? (
        <p className="mt-1 text-xs text-red-600" role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
