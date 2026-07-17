// Supabase Edge Function: sends workspace notification emails over SMTP
// from Supabase's infrastructure, so the Vercel app never opens SMTP
// connections itself (it calls this function over HTTPS).
//
// Deploy:  npx supabase functions deploy send-email --project-ref iccbchzopnomagcqbhqe
// Secrets: npx supabase secrets set SMTP_HOST=... SMTP_PORT=465 SMTP_USER=... SMTP_PASS=... SMTP_FROM=... --project-ref iccbchzopnomagcqbhqe
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // Only our own backend may call this: it must present the service role key.
  const auth = req.headers.get("Authorization");
  if (auth !== `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  let payload: { to?: unknown; subject?: unknown; html?: unknown };
  try {
    payload = await req.json();
  } catch {
    return new Response("Bad request", { status: 400 });
  }
  const to = Array.isArray(payload.to)
    ? payload.to.filter((e): e is string => typeof e === "string" && e.includes("@"))
    : [];
  const subject = typeof payload.subject === "string" ? payload.subject : "";
  const html = typeof payload.html === "string" ? payload.html : "";
  if (to.length === 0 || !subject || !html) {
    return new Response("Bad request", { status: 400 });
  }

  const host = Deno.env.get("SMTP_HOST");
  const user = Deno.env.get("SMTP_USER");
  const pass = Deno.env.get("SMTP_PASS");
  if (!host || !user || !pass) {
    return new Response("SMTP secrets not configured", { status: 500 });
  }

  const client = new SMTPClient({
    connection: {
      hostname: host,
      port: Number(Deno.env.get("SMTP_PORT") ?? 465),
      tls: true,
      auth: { username: user, password: pass },
    },
  });

  try {
    await client.send({
      from: Deno.env.get("SMTP_FROM") ?? user,
      bcc: to,
      subject,
      content: "This notification is best viewed as HTML.",
      html,
    });
    return Response.json({ ok: true, sent: to.length });
  } catch (err) {
    return new Response(
      `Send failed: ${err instanceof Error ? err.message : "unknown"}`,
      { status: 502 },
    );
  } finally {
    try {
      await client.close();
    } catch {
      // already closed
    }
  }
});
