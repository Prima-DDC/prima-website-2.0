"use client";

import { Loader2, ShieldCheck, ShieldOff, Smartphone } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useConfirm } from "@/components/ConfirmDialog";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const inputClass =
  "w-full rounded-md border border-line bg-white px-4 py-3 text-center font-mono text-lg tracking-[0.4em] text-ink outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/20";

interface Enrollment {
  factorId: string;
  qr: string;
  secret: string;
}

/** TOTP two-factor authentication: enroll with QR, verify, and disable. */
export function MfaManager() {
  const confirm = useConfirm();
  const [loading, setLoading] = useState(true);
  const [verifiedFactorId, setVerifiedFactorId] = useState<string | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enabledNow, setEnabledNow] = useState(false);

  const refresh = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.auth.mfa.listFactors();
    const verified = data?.totp.find((f) => f.status === "verified");
    setVerifiedFactorId(verified?.id ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    createSupabaseBrowserClient()
      .auth.mfa.listFactors()
      .then(({ data }) => {
        if (!active) return;
        const verified = data?.totp.find((f) => f.status === "verified");
        setVerifiedFactorId(verified?.id ?? null);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const startEnrollment = async () => {
    setBusy(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    // Clear any unverified leftovers so enroll does not hit the factor limit.
    const { data: existing } = await supabase.auth.mfa.listFactors();
    for (const factor of existing?.totp.filter((f) => f.status !== "verified") ?? []) {
      await supabase.auth.mfa.unenroll({ factorId: factor.id });
    }
    const { data, error: enrollError } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: `PRIMA-${Date.now()}`,
    });
    setBusy(false);
    if (enrollError || !data) {
      setError(enrollError?.message ?? "Could not start enrollment.");
      return;
    }
    setEnrollment({
      factorId: data.id,
      qr: data.totp.qr_code,
      secret: data.totp.secret,
    });
  };

  const verifyEnrollment = async () => {
    if (!enrollment || code.length !== 6) return;
    setBusy(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { data: challenge, error: challengeError } =
      await supabase.auth.mfa.challenge({ factorId: enrollment.factorId });
    if (challengeError || !challenge) {
      setBusy(false);
      setError(challengeError?.message ?? "Challenge failed.");
      return;
    }
    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: enrollment.factorId,
      challengeId: challenge.id,
      code,
    });
    setBusy(false);
    if (verifyError) {
      setError("That code was not accepted. Check your authenticator app and try again.");
      return;
    }
    setEnrollment(null);
    setCode("");
    setEnabledNow(true);
    refresh();
  };

  const disable = async () => {
    if (!verifiedFactorId) return;
    const ok = await confirm({
      tone: "danger",
      title: "Disable two-factor authentication?",
      message:
        "Your account will no longer require an authenticator code at sign-in. You can re-enable it at any time.",
      confirmLabel: "Disable 2FA",
    });
    if (!ok) return;
    setBusy(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { error: unenrollError } = await supabase.auth.mfa.unenroll({
      factorId: verifiedFactorId,
    });
    setBusy(false);
    if (unenrollError) {
      setError(unenrollError.message);
      return;
    }
    setEnabledNow(false);
    refresh();
  };

  const qrSrc = enrollment
    ? enrollment.qr.startsWith("data:")
      ? enrollment.qr
      : `data:image/svg+xml;utf8,${encodeURIComponent(enrollment.qr)}`
    : null;

  return (
    <div className="rounded-lg border border-line bg-white p-7">
      <h2 className="text-lg font-bold text-navy">Two-factor authentication</h2>
      <p className="mt-1 text-sm text-slate-body">
        Add a one-time code from an authenticator app (Google Authenticator,
        Authy, 1Password) to every sign-in.
      </p>

      {error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      {enabledNow ? (
        <p className="mt-4 rounded-md border border-brand/30 bg-mist px-4 py-3 text-sm text-brand-dark" role="status">
          Two-factor authentication is now active. You will be asked for a code
          at your next sign-in.
        </p>
      ) : null}

      {loading ? (
        <p className="mt-5 flex items-center gap-2 text-sm text-slate-body">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Checking status...
        </p>
      ) : verifiedFactorId ? (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-md border border-brand/30 bg-mist/60 px-5 py-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-brand-dark">
            <ShieldCheck className="h-5 w-5 text-brand" aria-hidden />
            Enabled with an authenticator app
          </p>
          <button
            type="button"
            onClick={disable}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
          >
            <ShieldOff className="h-3.5 w-3.5" aria-hidden />
            Disable
          </button>
        </div>
      ) : enrollment ? (
        <div className="mt-5 grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col items-center rounded-md border border-line bg-mist/40 p-5">
            {qrSrc ? (
              // eslint-disable-next-line @next/next/no-img-element -- QR is a local data URI
              <img src={qrSrc} alt="TOTP enrollment QR code" className="h-44 w-44 rounded bg-white p-2" />
            ) : null}
            <p className="mt-3 text-center text-xs text-slate-body">
              Scan with your authenticator app, or enter the key manually:
            </p>
            <code className="mt-2 break-all rounded bg-white px-2 py-1 text-center text-[11px] text-navy">
              {enrollment.secret}
            </code>
          </div>
          <div className="flex flex-col justify-center">
            <label htmlFor="mfa-code" className="mb-1.5 block text-sm font-semibold text-navy">
              Enter the 6-digit code
            </label>
            <input
              id="mfa-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className={inputClass}
            />
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={verifyEnrollment}
                disabled={busy || code.length !== 6}
                className="inline-flex items-center gap-2 rounded bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <ShieldCheck className="h-4 w-4" aria-hidden />}
                Verify & enable
              </button>
              <button
                type="button"
                onClick={() => {
                  setEnrollment(null);
                  setCode("");
                }}
                className="rounded border border-line px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:border-navy"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={startEnrollment}
          disabled={busy}
          className="mt-5 inline-flex items-center gap-2 rounded bg-navy px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-navy-deep hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Smartphone className="h-4 w-4" aria-hidden />}
          Enable two-factor authentication
        </button>
      )}
    </div>
  );
}
