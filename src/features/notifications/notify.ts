import "server-only";
import nodemailer from "nodemailer";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Role } from "@/features/auth/helpers";

export interface NotificationInput {
  title: string;
  body: string;
  /** Workspace path the notification links to, e.g. /portal/approvals/<id>. */
  link?: string;
}

function transporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: Number(process.env.SMTP_PORT ?? 465) === 465,
    auth: { user, pass },
  });
}

function emailHtml(title: string, body: string, link: string | null): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.primaddc.com";
  const cta = link
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:28px auto 0;"><tr><td style="background-color:#018f55;border-radius:8px;"><a href="${siteUrl}${link}" target="_blank" style="display:inline-block;padding:13px 36px;color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none;">Open in the Workspace</a></td></tr></table>`
    : "";
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#eef5f1;padding:32px 12px;font-family:Arial,Helvetica,sans-serif;"><tr><td align="center"><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;"><tr><td style="height:6px;background-color:#018f55;border-radius:12px 12px 0 0;font-size:0;line-height:0;">&nbsp;</td></tr><tr><td style="background-color:#141d3d;padding:24px 40px;text-align:center;"><p style="margin:0;color:#ffffff;font-size:16px;font-weight:bold;letter-spacing:2px;">PRIMA WORKSPACE</p><p style="margin:6px 0 0;color:#5cb531;font-size:11px;letter-spacing:1px;">TRUSTED INTELLIGENCE FOR CRITICAL DECISIONS</p></td></tr><tr><td style="background-color:#ffffff;padding:36px 40px;"><h1 style="margin:0;color:#1e2a54;font-size:20px;line-height:1.4;">${title}</h1><p style="margin:14px 0 0;color:#45506b;font-size:14px;line-height:1.7;">${body}</p>${cta}</td></tr><tr><td style="background-color:#1e2a54;border-radius:0 0 12px 12px;padding:20px 40px;text-align:center;"><p style="margin:0;color:#9fb3ae;font-size:11px;">PRIMA Due Diligence Consult | Accra &bull; Tamale &bull; Kigali</p><p style="margin:8px 0 0;color:#6e7a99;font-size:10px;">This is an automated workspace notification.</p></td></tr></table></td></tr></table>`;
}

/**
 * Notifies workspace members: always writes in-app notifications, and sends
 * a branded email best-effort (a mail outage must never break the action).
 */
export async function notify(
  userIds: string[],
  input: NotificationInput,
): Promise<void> {
  const recipients = [...new Set(userIds)].filter(Boolean);
  if (recipients.length === 0) return;

  const db = createSupabaseAdminClient();
  await db.from("notifications").insert(
    recipients.map((userId) => ({
      user_id: userId,
      title: input.title,
      body: input.body,
      link: input.link ?? null,
    })),
  );

  try {
    const mail = transporter();
    if (!mail) return;
    const { data: profiles } = await db
      .from("profiles")
      .select("email")
      .in("id", recipients);
    const emails = (profiles ?? []).map((p) => p.email).filter(Boolean);
    if (emails.length === 0) return;
    await mail.sendMail({
      from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
      bcc: emails,
      subject: `PRIMA Workspace: ${input.title}`,
      html: emailHtml(input.title, input.body, input.link ?? null),
    });
  } catch (err) {
    console.error("notification email failed:", err);
  }
}

/** All user ids holding any of the given roles. */
export async function userIdsByRole(roles: Role[]): Promise<string[]> {
  const db = createSupabaseAdminClient();
  const { data } = await db.from("profiles").select("id").in("role", roles);
  return (data ?? []).map((row) => row.id);
}
