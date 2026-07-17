"use client";

import {
  ArrowDown,
  ArrowUp,
  Check,
  Lock,
  Plus,
  Trash2,
  Workflow,
} from "lucide-react";
import { useActionState } from "react";
import { ConfirmButton } from "@/components/ConfirmDialog";
import type { ApprovalStage } from "@/features/ops/config";
import {
  createRole,
  deleteRole,
  moveStage,
  renameRole,
  setPermission,
  type RolesState,
} from "./actions";
import type { RoleRow } from "./queries";

const initial: RolesState = { error: null };
const inputClass =
  "rounded-md border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/20";

export interface PermissionMatrix {
  [role: string]: { submit: string[]; approve: string[] };
}

function Feedback({ state }: { state: RolesState }) {
  if (state.error) {
    return (
      <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
        {state.error}
      </p>
    );
  }
  if (state.success) {
    return (
      <p className="mt-3 rounded-md border border-brand/30 bg-mist px-3 py-2 text-xs text-brand-dark" role="status">
        {state.success}
      </p>
    );
  }
  return null;
}

function RoleLine({ role, members }: { role: RoleRow; members: number }) {
  const [renameState, renameAction, renamePending] = useActionState(renameRole, initial);
  const [deleteState, deleteAction] = useActionState(deleteRole, initial);
  const protectedRole = role.builtIn || role.key === "admin";

  return (
    <li className="rounded-md border border-line bg-white p-4">
      <div className="flex flex-wrap items-center gap-3">
        <form action={renameAction} className="flex flex-1 items-center gap-2">
          <input type="hidden" name="key" value={role.key} />
          <input
            name="label"
            defaultValue={role.label}
            minLength={2}
            maxLength={60}
            className={`${inputClass} w-40 flex-1 sm:flex-none`}
            aria-label={`Label for role ${role.key}`}
          />
          <button
            type="submit"
            disabled={renamePending}
            className="rounded border border-line p-2 text-navy transition-colors hover:border-brand hover:text-brand disabled:opacity-50"
            aria-label="Save role name"
            title="Save role name"
          >
            <Check className="h-4 w-4" />
          </button>
          <span className="text-xs text-slate-body">
            key: <code className="rounded bg-mist px-1.5 py-0.5">{role.key}</code>
          </span>
          <span className="text-xs text-slate-body">
            {members} member{members === 1 ? "" : "s"}
          </span>
        </form>
        {protectedRole ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-mist px-3 py-1 text-xs font-semibold text-slate-body">
            <Lock className="h-3 w-3" aria-hidden /> Built-in
          </span>
        ) : (
          <form action={deleteAction}>
            <input type="hidden" name="key" value={role.key} />
            <ConfirmButton
              dialog={{
                tone: "danger",
                title: `Delete the ${role.label} role?`,
                message:
                  "The role, its request permissions, and its place in the approval chain are removed. Deletion is only possible while no member holds it.",
                confirmLabel: "Delete role",
              }}
              className="inline-flex items-center gap-1.5 rounded border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden /> Delete
            </ConfirmButton>
          </form>
        )}
      </div>
      <Feedback state={renameState.error || renameState.success ? renameState : deleteState} />
    </li>
  );
}

function PermChip({
  role,
  docType,
  field,
  active,
}: {
  role: string;
  docType: string;
  field: "can_submit" | "can_approve";
  active: boolean;
}) {
  return (
    <form action={setPermission} className="inline">
      <input type="hidden" name="role" value={role} />
      <input type="hidden" name="docType" value={docType} />
      <input type="hidden" name="field" value={field} />
      <input type="hidden" name="value" value={String(!active)} />
      <button
        type="submit"
        aria-pressed={active}
        className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold transition-all ${
          active
            ? "border-brand bg-brand text-white shadow-sm shadow-brand/25"
            : "border-line bg-white text-slate-body hover:border-brand/50 hover:text-navy"
        }`}
      >
        {active ? <Check className="h-3 w-3" aria-hidden /> : null}
        {docType
          .split("_")
          .map((w) => w[0].toUpperCase() + w.slice(1))
          .join(" ")}
      </button>
    </form>
  );
}

function StageLine({ stage, index, total }: { stage: ApprovalStage; index: number; total: number }) {
  const [, moveAction] = useActionState(moveStage, initial);
  return (
    <li className="flex items-center gap-3 rounded-md border border-line bg-white p-4">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand font-serif text-sm font-bold text-white">
        {index + 1}
      </span>
      <p className="flex-1 text-sm font-bold text-navy">{stage.label}</p>
      <form action={moveAction} className="flex gap-1">
        <input type="hidden" name="role" value={stage.role} />
        <button
          type="submit"
          name="direction"
          value="up"
          disabled={index === 0}
          className="rounded border border-line p-1.5 text-navy transition-colors hover:border-brand hover:text-brand disabled:opacity-30"
          aria-label={`Move ${stage.label} earlier`}
        >
          <ArrowUp className="h-4 w-4" />
        </button>
        <button
          type="submit"
          name="direction"
          value="down"
          disabled={index === total - 1}
          className="rounded border border-line p-1.5 text-navy transition-colors hover:border-brand hover:text-brand disabled:opacity-30"
          aria-label={`Move ${stage.label} later`}
        >
          <ArrowDown className="h-4 w-4" />
        </button>
      </form>
    </li>
  );
}

export function RolesManager({
  roles,
  stages,
  memberCounts,
  docTypes,
  matrix,
}: {
  roles: RoleRow[];
  stages: ApprovalStage[];
  memberCounts: Record<string, number>;
  docTypes: Array<{ key: string; label: string }>;
  matrix: PermissionMatrix;
}) {
  const [createState, createAction, createPending] = useActionState(createRole, initial);

  return (
    <div className="space-y-6">
      {/* Roles CRUD */}
      <section className="rounded-lg border border-line bg-white p-6">
        <h2 className="font-semibold text-navy">Workspace roles</h2>
        <p className="mt-1 text-xs text-slate-body">
          Rename any role. Custom roles can be deleted once no member holds them.
        </p>
        <form action={createAction} className="mt-4 flex gap-2">
          <input
            name="label"
            placeholder="New role name (e.g. Finance)"
            minLength={2}
            maxLength={60}
            required
            className={`${inputClass} flex-1`}
          />
          <button
            type="submit"
            disabled={createPending}
            className="inline-flex items-center gap-1.5 rounded bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-50"
          >
            <Plus className="h-4 w-4" aria-hidden />
            {createPending ? "Adding..." : "Add role"}
          </button>
        </form>
        <Feedback state={createState} />
        <ul className="mt-4 space-y-3">
          {roles.map((role) => (
            <RoleLine key={role.key} role={role} members={memberCounts[role.key] ?? 0} />
          ))}
        </ul>
      </section>

      {/* Per-request-type permission matrix */}
      <section className="rounded-lg border border-line bg-white p-6">
        <h2 className="font-semibold text-navy">Request permissions</h2>
        <p className="mt-1 text-xs text-slate-body">
          For each role, choose which request types it can submit and which it
          can approve. A role can be granted one, several, or all of them. A role
          that can approve a type automatically joins that type&apos;s approval
          chain (order is set below).
        </p>
        <div className="mt-5 space-y-4">
          {roles.map((role) => {
            const perms = matrix[role.key] ?? { submit: [], approve: [] };
            return (
              <div key={role.key} className="rounded-lg border border-line bg-mist/30 p-4">
                <p className="text-sm font-bold text-navy">{role.label}</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-[5rem_1fr]">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-body sm:pt-1.5">
                    Submit
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {docTypes.map((dt) => (
                      <PermChip
                        key={`s-${role.key}-${dt.key}`}
                        role={role.key}
                        docType={dt.key}
                        field="can_submit"
                        active={perms.submit.includes(dt.key)}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-body sm:pt-1.5">
                    Approve
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {docTypes.map((dt) => (
                      <PermChip
                        key={`a-${role.key}-${dt.key}`}
                        role={role.key}
                        docType={dt.key}
                        field="can_approve"
                        active={perms.approve.includes(dt.key)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Approval chain order */}
      <section className="rounded-lg border border-line bg-white p-6">
        <h2 className="flex items-center gap-2 font-semibold text-navy">
          <Workflow className="h-4 w-4 text-brand" aria-hidden />
          Approval chain order
        </h2>
        <p className="mt-1 text-xs text-slate-body">
          Roles appear here once they can approve at least one request type.
          Sign-off happens in this order; for any given request only the roles
          that approve that type take part, and the last of them issues the PDF.
        </p>
        {stages.length === 0 ? (
          <p className="mt-4 rounded-md border border-dashed border-line bg-mist/40 px-4 py-6 text-center text-sm text-slate-body">
            No approver roles yet. Grant an approve permission above to build the chain.
          </p>
        ) : (
          <ol className="mt-4 space-y-3">
            {stages.map((stage, index) => (
              <StageLine key={stage.role} stage={stage} index={index} total={stages.length} />
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
