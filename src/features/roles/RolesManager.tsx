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
  addStage,
  createRole,
  deleteRole,
  moveStage,
  removeStage,
  renameRole,
  toggleRoleSubmission,
  type RolesState,
} from "./actions";
import type { RoleRow } from "./queries";

const initial: RolesState = { error: null };
const inputClass =
  "rounded-md border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/20";

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
  const [submitState, submitAction, submitPending] = useActionState(
    toggleRoleSubmission,
    initial,
  );
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
                  "The role is removed from the approval chain too. Deletion is only possible while no member holds it.",
                confirmLabel: "Delete role",
              }}
              className="inline-flex items-center gap-1.5 rounded border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden /> Delete
            </ConfirmButton>
          </form>
        )}
      </div>
      <form action={submitAction} className="mt-3 flex items-center gap-2">
        <input type="hidden" name="key" value={role.key} />
        <input type="hidden" name="allow" value={String(!role.canSubmit)} />
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
            role.canSubmit ? "bg-brand/10 text-brand-dark" : "bg-line/50 text-slate-body"
          }`}
        >
          {role.canSubmit ? "Can submit requests" : "Cannot submit requests"}
        </span>
        <button
          type="submit"
          disabled={submitPending}
          className="rounded border border-line px-3 py-1.5 text-xs font-semibold text-navy transition-colors hover:border-brand hover:text-brand disabled:opacity-50"
        >
          {submitPending
            ? "Saving..."
            : role.canSubmit
              ? "Revoke submission"
              : "Allow submission"}
        </button>
      </form>
      <Feedback
        state={
          renameState.error || renameState.success
            ? renameState
            : submitState.error || submitState.success
              ? submitState
              : deleteState
        }
      />
    </li>
  );
}

function StageLine({
  stage,
  index,
  total,
}: {
  stage: ApprovalStage;
  index: number;
  total: number;
}) {
  const [moveState, moveAction] = useActionState(moveStage, initial);
  const [removeState, removeAction] = useActionState(removeStage, initial);

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
      <form action={removeAction}>
        <input type="hidden" name="role" value={stage.role} />
        <ConfirmButton
          dialog={{
            tone: "danger",
            title: `Remove ${stage.label} from the chain?`,
            message:
              "Documents currently waiting on this stage will move to the next configured stage. Recorded sign-offs are kept.",
            confirmLabel: "Remove stage",
          }}
          className="rounded border border-red-200 p-1.5 text-red-600 transition-colors hover:bg-red-50"
          aria-label={`Remove ${stage.label} stage`}
        >
          <Trash2 className="h-4 w-4" />
        </ConfirmButton>
      </form>
      <Feedback state={moveState.error ? moveState : removeState} />
    </li>
  );
}

export function RolesManager({
  roles,
  stages,
  memberCounts,
}: {
  roles: RoleRow[];
  stages: ApprovalStage[];
  memberCounts: Record<string, number>;
}) {
  const [createState, createAction, createPending] = useActionState(createRole, initial);
  const [addState, addAction, addPending] = useActionState(addStage, initial);
  const available = roles.filter(
    (role) =>
      role.key !== "client" && !stages.some((stage) => stage.role === role.key),
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
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

      {/* Approval chain configuration */}
      <section className="rounded-lg border border-line bg-white p-6">
        <h2 className="flex items-center gap-2 font-semibold text-navy">
          <Workflow className="h-4 w-4 text-brand" aria-hidden />
          Request approval chain
        </h2>
        <p className="mt-1 text-xs text-slate-body">
          Every request must be signed off by these roles, in this order. The
          final stage issues the official PDF. Changes apply immediately,
          including to documents already in review.
        </p>
        <ol className="mt-4 space-y-3">
          {stages.map((stage, index) => (
            <StageLine key={stage.role} stage={stage} index={index} total={stages.length} />
          ))}
        </ol>
        {available.length > 0 ? (
          <form action={addAction} className="mt-4 flex gap-2">
            <select name="role" className={`${inputClass} flex-1`} defaultValue={available[0]?.key}>
              {available.map((role) => (
                <option key={role.key} value={role.key}>
                  {role.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={addPending}
              className="inline-flex items-center gap-1.5 rounded bg-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-navy-deep disabled:opacity-50"
            >
              <Plus className="h-4 w-4" aria-hidden />
              {addPending ? "Adding..." : "Add stage"}
            </button>
          </form>
        ) : null}
        <Feedback state={addState} />
      </section>
    </div>
  );
}
