"use client";

import { CheckCircle2, Send, ShieldCheck } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { submitContactEnquiry, type ContactState } from "./actions";

const initialState: ContactState = { status: "idle" };

const inputClass =
  "w-full rounded-md border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition-all placeholder:text-slate-body/50 focus:border-brand focus:ring-2 focus:ring-brand/20";

export function ContactForm({
  locale,
  services,
}: {
  locale: string;
  services: Array<{ slug: string; title: string }>;
}) {
  const t = useTranslations("contactForm");
  const [state, formAction, pending] = useActionState(
    submitContactEnquiry,
    initialState,
  );
  // Set after mount so the anti-bot time gate measures real user dwell time.
  const renderedAtRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (renderedAtRef.current) {
      renderedAtRef.current.value = String(Date.now());
    }
  }, []);

  if (state.status === "success") {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-lg border border-brand/30 bg-mist/60 p-10 text-center">
        <CheckCircle2 className="h-12 w-12 text-brand" aria-hidden />
        <p className="mt-5 max-w-md text-lg font-medium leading-relaxed text-navy">
          {t("success")}
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="rounded-lg border border-line bg-white p-7 shadow-sm sm:p-9">
      <h2 className="text-2xl font-bold text-navy">{t("title")}</h2>
      <p className="mt-2 flex items-center gap-2 text-sm text-slate-body">
        <ShieldCheck className="h-4 w-4 text-brand" aria-hidden />
        {t("confidentialityNote")}
      </p>

      {state.status === "error" ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {t("error")}
        </p>
      ) : null}

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="mb-1.5 block text-sm font-semibold text-navy">
            {t("name")}
          </label>
          <input
            id="contact-name"
            name="name"
            required
            minLength={2}
            maxLength={200}
            autoComplete="name"
            className={inputClass}
            aria-invalid={state.fieldErrors?.name || undefined}
          />
          {state.fieldErrors?.name ? (
            <p className="mt-1 text-xs text-red-600">{t("validation.name")}</p>
          ) : null}
        </div>
        <div>
          <label htmlFor="contact-email" className="mb-1.5 block text-sm font-semibold text-navy">
            {t("email")}
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            maxLength={320}
            autoComplete="email"
            className={inputClass}
            aria-invalid={state.fieldErrors?.email || undefined}
          />
          {state.fieldErrors?.email ? (
            <p className="mt-1 text-xs text-red-600">{t("validation.email")}</p>
          ) : null}
        </div>
        <div>
          <label htmlFor="contact-phone" className="mb-1.5 block text-sm font-semibold text-navy">
            {t("phone")}
          </label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            maxLength={50}
            autoComplete="tel"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="contact-service" className="mb-1.5 block text-sm font-semibold text-navy">
            {t("serviceInterest")}
          </label>
          <select id="contact-service" name="serviceInterest" defaultValue="" className={inputClass}>
            <option value="">{t("generalEnquiry")}</option>
            {services.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="contact-message" className="mb-1.5 block text-sm font-semibold text-navy">
            {t("message")}
          </label>
          <textarea
            id="contact-message"
            name="message"
            required
            minLength={10}
            maxLength={5000}
            rows={6}
            className={inputClass}
            aria-invalid={state.fieldErrors?.message || undefined}
          />
          {state.fieldErrors?.message ? (
            <p className="mt-1 text-xs text-red-600">{t("validation.message")}</p>
          ) : null}
        </div>
      </div>

      {/* Anti-spam: honeypot + render timestamp */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />
      <input type="hidden" name="renderedAt" defaultValue="" ref={renderedAtRef} />
      <input type="hidden" name="locale" value={locale} />

      <button
        type="submit"
        disabled={pending}
        className="group mt-7 inline-flex items-center gap-2 rounded bg-brand px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition-all hover:-translate-y-0.5 hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        {pending ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
