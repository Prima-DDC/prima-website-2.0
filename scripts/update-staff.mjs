// Corrects staff identity from files/STAFF NAMES AND POSITIONS.xlsx: accurate
// first/last/full name, job title (position), and Ghana branch. Matched by
// email. Never changes role or permissions. Idempotent.
// Run with: npm run staff:update
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Supabase env vars missing");
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false } });

// email -> corrected record (from the staff sheet). branch defaults to ghana.
const STAFF = [
  { email: "primaddc@gmail.com", first: "Doris", last: "Amedior", title: "Chief Executive Officer" },
  { email: "ezilevu@primaddc.com", first: "Emmanuel", last: "Zilevu", title: "Chief Operating Officer" },
  { email: "adrah.benjamin@gmail.com", first: "Benjamin", last: "Adrah", title: "General Manager" },
  { email: "lbonsu@primaddc.com", first: "Lydia", last: "Bonsu", title: "Finance Manager" },
  { email: "attohwillibald@gmail.com", first: "Willibald", last: "Attoh", title: "Director" },
  { email: "amadumuntawakilu@gmail.com", first: "Muntawakilu Dajema", last: "Amadu", title: "Operations Manager" },
  { email: "santwi542@gmail.com", first: "Stephen", last: "Antwi", title: "Senior Intelligence Officer" },
  { email: "sofrimpong@primaddc.com", first: "Solomon Osei", last: "Frimpong", title: "Intelligence Officer/Admin" },
  { email: "asuleiman2810@gmail.com", first: "Suleiman Ahmed", last: "Ibn Ahmed", title: "IT Officer", contract: true },
];

let ok = 0;
for (const s of STAFF) {
  const update = {
    first_name: s.first,
    last_name: s.last,
    full_name: `${s.first} ${s.last}`,
    job_title: s.title,
    branch: "ghana",
  };
  if (s.contract) update.contract_staff = true;
  const { data, error } = await db
    .from("profiles")
    .update(update)
    .eq("email", s.email)
    .select("email, full_name, job_title");
  if (error) { console.error(`  ${s.email}: ERROR ${error.message}`); continue; }
  if (!data || data.length === 0) { console.warn(`  ${s.email}: no matching profile (skipped)`); continue; }
  console.log(`  ${data[0].full_name.padEnd(24)} | ${data[0].job_title}`);
  ok++;
}
console.log(`staff update complete: ${ok}/${STAFF.length} updated`);
