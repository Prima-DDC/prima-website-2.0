// Uploads the branded Supabase Auth email templates (the single source of
// truth in supabase/email-templates/) to the live project via the Management
// API, so their links use the app's /auth/confirm?token_hash=... flow instead
// of the default {{ .ConfirmationURL }} implicit flow. Idempotent: re-run any
// time the templates get reset to defaults.
// Run with: npm run email:templates
import { readFileSync } from "node:fs";
import path from "node:path";

const token = process.env.SUPABASE_ACCESS_TOKEN;
const ref = process.env.SUPABASE_PROJECT_REF ?? "iccbchzopnomagcqbhqe";
if (!token) {
  console.error("SUPABASE_ACCESS_TOKEN is not set (see .env.local)");
  process.exit(1);
}

const DIR = path.resolve("supabase/email-templates");

// type -> { file, subject }. Subjects match each template's header comment.
const TEMPLATES = {
  invite: { file: "invite.html", subject: "You are invited to the PRIMA Workspace" },
  confirmation: { file: "confirmation.html", subject: "Confirm your PRIMA Workspace email" },
  recovery: { file: "recovery.html", subject: "Reset your PRIMA Workspace password" },
  magic_link: { file: "magic-link.html", subject: "Your PRIMA Workspace sign-in link" },
  email_change: { file: "email-change.html", subject: "Confirm your new PRIMA Workspace email" },
  reauthentication: { file: "reauthentication.html", subject: "Your PRIMA verification code" },
};

const body = {};
for (const [type, { file, subject }] of Object.entries(TEMPLATES)) {
  body[`mailer_templates_${type}_content`] = readFileSync(path.join(DIR, file), "utf8");
  body[`mailer_subjects_${type}`] = subject;
}

const url = `https://api.supabase.com/v1/projects/${ref}/config/auth`;
const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

const res = await fetch(url, { method: "PATCH", headers, body: JSON.stringify(body) });
if (!res.ok) {
  console.error(`PATCH failed: ${res.status} ${await res.text()}`);
  process.exit(1);
}
console.log("templates uploaded (PATCH 200)");

// Verify: re-read and assert the invite template now uses the custom flow.
const cfg = await (await fetch(url, { headers })).json();
const invite = cfg.mailer_templates_invite_content ?? "";
const ok = invite.includes("/auth/confirm") && invite.includes("TokenHash");
const flags = cfg.mailer_templates_custom_contents ?? {};
for (const type of Object.keys(TEMPLATES)) {
  const key = `MAILER_TEMPLATES_${type.toUpperCase()}_CONTENT`;
  console.log(`  ${type}: custom=${flags[key] === true}, subject=${JSON.stringify(cfg[`mailer_subjects_${type}`])}`);
}
console.log(ok ? "verified: invite links to /auth/confirm?token_hash=..." : "WARNING: invite template does not look custom");
if (!ok) process.exit(1);
