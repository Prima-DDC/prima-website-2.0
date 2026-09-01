import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { ConfirmButton } from "@/components/ConfirmDialog";
import { requireCapability } from "@/features/capabilities/service";
import { updateUserRole } from "@/features/users/actions";
import { InviteUserForm } from "@/features/users/InviteUserForm";
import { UserRowActions } from "@/features/users/UserRowActions";
import { getRoles } from "@/features/roles/queries";
import {
  ListToolbar,
  filterSelectClass,
  matchesQuery,
} from "@/features/internal/ListToolbar";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string }>;
}) {
  const acting = await requireCapability("manage_users");
  const { q, role } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const roles = await getRoles();
  let query = supabase
    .from("profiles")
    .select("id, email, full_name, role, job_title, photo_path, created_at")
    .order("created_at");
  if (role) query = query.eq("role", role);
  const { data: allUsers } = await query;
  const users = (allUsers ?? []).filter((u) =>
    matchesQuery(q, u.full_name, u.email, u.job_title),
  );

  // Users who were invited but have not confirmed their email yet are pending;
  // they get a "Resend invite" action instead of a password reset.
  const admin = createSupabaseAdminClient();
  const { data: authList } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const pendingIds = new Set(
    (authList?.users ?? [])
      .filter((u) => !u.email_confirmed_at)
      .map((u) => u.id),
  );

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold text-navy">Users</h1>
      <p className="mt-1 text-sm text-slate-body">
        Manage workspace access and roles.
      </p>

      <ListToolbar action="/admin/users" q={q} placeholder="Search by name, email, or job title">
        <select name="role" defaultValue={role ?? ""} className={filterSelectClass}>
          <option value="">All roles</option>
          {roles.map((r) => (
            <option key={r.key} value={r.key}>{r.label}</option>
          ))}
        </select>
      </ListToolbar>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="overflow-hidden rounded-lg border border-line bg-white lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-mist/50 text-xs uppercase tracking-wider text-slate-body">
                <tr>
                  <th className="px-5 py-3 font-semibold">User</th>
                  <th className="px-5 py-3 font-semibold">Role</th>
                  <th className="px-5 py-3 font-semibold">Joined</th>
                  <th className="px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-sm text-slate-body">
                      No users match your search.
                    </td>
                  </tr>
                ) : null}
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar
                          photoPath={user.photo_path}
                          name={user.full_name || user.email}
                          size={34}
                        />
                        <div>
                          <Link
                            href={`/admin/users/${user.id}`}
                            className="font-semibold text-brand hover:text-brand-dark"
                          >
                            {user.full_name || user.email}
                          </Link>
                          {user.id === acting.id ? (
                            <span className="ml-2 rounded-full bg-mist px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-body">
                              you
                            </span>
                          ) : pendingIds.has(user.id) ? (
                            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-800">
                              pending
                            </span>
                          ) : null}
                          <p className="text-xs text-slate-body">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      {user.id === acting.id ? (
                        <span className="text-sm font-medium capitalize text-navy">
                          {user.role}
                        </span>
                      ) : (
                        <form action={updateUserRole}>
                          <input type="hidden" name="userId" value={user.id} />
                          <select
                            name="role"
                            defaultValue={user.role}
                            className="rounded-md border border-line bg-white px-2.5 py-1.5 text-xs font-medium text-navy outline-none focus:border-brand"
                          >
                            {roles.map((r) => (
                              <option key={r.key} value={r.key}>
                                {r.label}
                              </option>
                            ))}
                          </select>
                          <ConfirmButton
                            dialog={{
                              tone: "brand",
                              title: "Change this user's role?",
                              message: `The new role takes effect immediately for ${user.full_name || user.email}, changing what they can see and do across the workspace.`,
                              confirmLabel: "Apply new role",
                            }}
                            className="ml-2 rounded border border-line px-2.5 py-1.5 text-xs font-semibold text-navy transition-colors hover:border-brand hover:text-brand"
                          >
                            Save
                          </ConfirmButton>
                        </form>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-body">
                      {new Date(user.created_at).toLocaleDateString("en-GB")}
                    </td>
                    <td className="px-5 py-3.5">
                      {user.id === acting.id ? (
                        <span className="text-xs text-slate-body/60">Signed in</span>
                      ) : (
                        <UserRowActions
                          userId={user.id}
                          email={user.email}
                          name={user.full_name || user.email}
                          pending={pendingIds.has(user.id)}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <InviteUserForm roles={roles.map((r) => ({ key: r.key, label: r.label }))} />
      </div>
    </div>
  );
}
