// Applies supabase/migrations/*.sql in order against SUPABASE_DB_URL,
// tracking applied files in public._migrations. Idempotent.
// Run with: npm run db:migrate
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const dbUrl = process.env.SUPABASE_DB_URL;
if (!dbUrl) {
  console.error("SUPABASE_DB_URL is not set (see .env.local)");
  process.exit(1);
}

const client = new pg.Client({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
try {
  await client.query(
    "create table if not exists public._migrations (name text primary key, applied_at timestamptz not null default now())",
  );
  const dir = path.resolve("supabase/migrations");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();
  const { rows } = await client.query("select name from public._migrations");
  const applied = new Set(rows.map((r) => r.name));

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`skip   ${file}`);
      continue;
    }
    const sql = await readFile(path.join(dir, file), "utf8");
    console.log(`apply  ${file}`);
    await client.query("begin");
    try {
      await client.query(sql);
      await client.query("insert into public._migrations (name) values ($1)", [
        file,
      ]);
      await client.query("commit");
    } catch (err) {
      await client.query("rollback");
      throw err;
    }
  }
  console.log("migrations up to date");
} finally {
  await client.end();
}
