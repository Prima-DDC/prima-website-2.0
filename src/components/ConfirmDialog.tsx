"use client";

import { AlertTriangle, ShieldQuestion } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "brand";
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

export function useConfirm(): ConfirmFn {
  const confirm = useContext(ConfirmContext);
  if (!confirm) throw new Error("useConfirm must be used within ConfirmProvider");
  return confirm;
}

/**
 * Promise-based confirmation dialog: animated glass panel over a blurred
 * backdrop, danger/brand tones, ESC + backdrop dismissal, focus on confirm.
 */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<{
    options: ConfirmOptions;
    resolve: (result: boolean) => void;
  } | null>(null);
  const [leaving, setLeaving] = useState(false);
  const settled = useRef(false);

  const confirm = useCallback<ConfirmFn>(
    (options) =>
      new Promise((resolve) => {
        settled.current = false;
        setLeaving(false);
        setRequest({ options, resolve });
      }),
    [],
  );

  const settle = useCallback(
    (result: boolean) => {
      if (!request || settled.current) return;
      settled.current = true;
      request.resolve(result);
      setLeaving(true);
      setTimeout(() => {
        setRequest(null);
        setLeaving(false);
      }, 200);
    },
    [request],
  );

  useEffect(() => {
    if (!request) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") settle(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [request, settle]);

  const options = request?.options;
  const danger = options?.tone !== "brand";
  const Icon = danger ? AlertTriangle : ShieldQuestion;

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {options ? (
        <div
          className={`fixed inset-0 z-[90] flex items-end justify-center p-4 transition-opacity duration-200 sm:items-center ${
            leaving ? "opacity-0" : "opacity-100"
          }`}
        >
          <div
            aria-hidden
            onClick={() => settle(false)}
            className="absolute inset-0 bg-navy-deep/50 backdrop-blur-sm"
          />
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-message"
            className={`relative w-full max-w-md overflow-hidden rounded-2xl border border-white/40 bg-white/90 shadow-2xl shadow-navy-deep/40 backdrop-blur-xl transition-all duration-200 ${
              leaving
                ? "translate-y-3 scale-95 opacity-0"
                : "animate-dialog-in"
            }`}
          >
            <div
              aria-hidden
              className={`h-1.5 w-full ${
                danger
                  ? "bg-gradient-to-r from-red-600 via-red-400 to-red-600"
                  : "bg-gradient-to-r from-brand via-brand-bright to-brand"
              }`}
            />
            <div className="p-7">
              <div className="flex items-start gap-4">
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
                  <span
                    aria-hidden
                    className={`absolute inset-0 rounded-full animate-pulse-ring ${
                      danger ? "border-2 border-red-400/60" : "border-2 border-brand/50"
                    }`}
                  />
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-full ${
                      danger ? "bg-red-50 text-red-600" : "bg-mist text-brand"
                    }`}
                  >
                    <Icon className="h-5.5 w-5.5" aria-hidden />
                  </span>
                </div>
                <div className="min-w-0">
                  <h2 id="confirm-title" className="text-lg font-bold text-navy">
                    {options.title}
                  </h2>
                  <p
                    id="confirm-message"
                    className="mt-1.5 text-sm leading-relaxed text-slate-body"
                  >
                    {options.message}
                  </p>
                </div>
              </div>
              <div className="mt-7 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => settle(false)}
                  className="rounded-md border border-line bg-white px-5 py-2.5 text-sm font-semibold text-navy transition-all hover:-translate-y-0.5 hover:border-navy hover:shadow-md"
                >
                  {options.cancelLabel ?? "Cancel"}
                </button>
                <button
                  type="button"
                  autoFocus
                  onClick={() => settle(true)}
                  className={`rounded-md px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl ${
                    danger
                      ? "bg-red-600 shadow-red-600/25 hover:bg-red-700"
                      : "bg-brand shadow-brand/30 hover:bg-brand-dark"
                  }`}
                >
                  {options.confirmLabel ?? "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </ConfirmContext.Provider>
  );
}

/**
 * Submit button for server-action forms that asks for confirmation first.
 * On confirm it re-submits the surrounding form with this button as the
 * submitter, so name/value pairs (e.g. decision=approved) are preserved.
 * Without JavaScript the form still submits natively (no dialog).
 */
export function ConfirmButton({
  dialog,
  className,
  disabled,
  name,
  value,
  title,
  "aria-label": ariaLabel,
  children,
}: {
  dialog: ConfirmOptions;
  className?: string;
  disabled?: boolean;
  name?: string;
  value?: string;
  title?: string;
  "aria-label"?: string;
  children: ReactNode;
}) {
  const confirm = useConfirm();
  const ref = useRef<HTMLButtonElement>(null);
  const approved = useRef(false);

  return (
    <button
      ref={ref}
      type="submit"
      name={name}
      value={value}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
      className={className}
      onClick={async (e) => {
        if (approved.current) {
          approved.current = false;
          return;
        }
        e.preventDefault();
        if (await confirm(dialog)) {
          approved.current = true;
          ref.current?.form?.requestSubmit(ref.current);
        }
      }}
    >
      {children}
    </button>
  );
}
