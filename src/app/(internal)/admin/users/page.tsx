import { ConfirmButton } from "@/components/ConfirmDialog";
import { requireRole } from "@/features/auth/helpers";
import { updateUserRole } from "@/features/users/actions";
import { InviteUserForm } from "@/features/users/InviteUserForm";
import { UserRowActions } from "@/features/users/UserRowActions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function UsersPage() {
  const acting = await requireRole("admin");
  const supabase = await createSupabaseServerClient();
  const { data: users } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .order("created_at");

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold text-navy">Users</h1>
      <p className="mt-1 text-sm text-slate-body">
        Manage workspace access and roles.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
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
                {(users ?? []).map((user) => (
                  <tr key={user.id}>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-navy">
                        {user.full_name || user.email}
                        {user.id === acting.id ? (
                          <span className="ml-2 rounded-full bg-mist px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-body">
                            you
                          </span>
                        ) : null}
                      </p>
                      <p className="text-xs text-slate-body">{user.email}</p>
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
                            <option value="admin">Admin</option>
                            <option value="employee">Employee</option>
                            <option value="client">Client</option>
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
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <InviteUserForm />
      </div>
    </div>
  );
}
