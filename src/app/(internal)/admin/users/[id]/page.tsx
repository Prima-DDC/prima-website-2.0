import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { requireRole } from "@/features/auth/helpers";
import {
  STAFF_PROFILE_COLUMNS,
  toStaffProfile,
} from "@/features/profile/types";
import { getRoles } from "@/features/roles/queries";
import { AdminUserForm } from "@/features/users/AdminUserForm";
import { UserRowActions } from "@/features/users/UserRowActions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const acting = await requireRole("admin");

  const supabase = await createSupabaseServerClient();
  const { data: row } = await supabase
    .from("profiles")
    .select(STAFF_PROFILE_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (!row) notFound();
  const roles = await getRoles();
  const profile = toStaffProfile(row);
  const displayName =
    [profile.firstName, profile.lastName].filter(Boolean).join(" ") ||
    profile.fullName ||
    profile.email;

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-dark"
      >
        <ArrowLeft className="h-4 w-4" /> Users
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar photoPath={profile.photoPath} name={displayName} size={56} />
          <div>
            <h1 className="text-2xl font-bold text-navy">{displayName}</h1>
            <p className="mt-0.5 text-sm text-slate-body">{profile.email}</p>
          </div>
        </div>
        {profile.id !== acting.id ? (
          <UserRowActions userId={profile.id} email={profile.email} name={displayName} />
        ) : null}
      </div>

      <div className="mt-8">
        <AdminUserForm
          profile={profile}
          isSelf={profile.id === acting.id}
          roles={roles.map((r) => ({ key: r.key, label: r.label }))}
        />
      </div>
    </div>
  );
}
