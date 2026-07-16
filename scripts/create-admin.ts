// Bootstraps (or repairs) an admin user.
// Usage: npm run create-admin -- <email> <password> [full name]
import { createClient } from "@supabase/supabase-js";

const [email, password, ...nameParts] = process.argv.slice(2);
const fullName = nameParts.join(" ") || "PRIMA Administrator";

if (!email || !password) {
  console.error("Usage: npm run create-admin -- <email> <password> [full name]");
  process.exit(1);
}
if (password.length < 10) {
  console.error("Password must be at least 10 characters.");
  process.exit(1);
}

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

async function main() {
  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  let userId = created?.user?.id;
  if (error) {
    // Already exists: look the user up and reset the password instead.
    const { data: list } = await admin.auth.admin.listUsers();
    const existing = list.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase(),
    );
    if (!existing) {
      console.error(`Could not create or find user: ${error.message}`);
      process.exit(1);
    }
    userId = existing.id;
    await admin.auth.admin.updateUserById(userId, { password });
    console.log("existing user found, password updated");
  }

  const { error: profileError } = await admin
    .from("profiles")
    .upsert(
      { id: userId, email, full_name: fullName, role: "admin" },
      { onConflict: "id" },
    );
  if (profileError) {
    console.error(`Profile update failed: ${profileError.message}`);
    process.exit(1);
  }

  console.log(`admin ready: ${email} (role=admin)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
