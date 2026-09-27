"use client";

import { FormEvent, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createBusiness, updateBusiness, deleteBusiness } from "@/app/actions/businesses";
import { BusinessWithRelations, UserOption, ProjectOption } from "@/types";
import { SidePanel } from "./SidePanel";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 py-1 sm:flex-row sm:items-center sm:gap-3">
      <span className="field-label w-32 shrink-0">{label}</span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export function BusinessPanel({
  business,
  users,
  projects,
  onClose,
}: {
  business?: BusinessWithRelations;
  users: UserOption[];
  projects: ProjectOption[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEdit = Boolean(business);
  const formId = "business-form";

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      if (business) {
        await updateBusiness(business.id, formData);
      } else {
        await createBusiness(formData);
      }
      router.refresh();
      onClose();
    });
  }

  function handleDelete() {
    if (!business) return;
    if (!confirm("Remove this business from the pipeline?")) return;
    startTransition(async () => {
      await deleteBusiness(business.id);
      router.refresh();
      onClose();
    });
  }

  return (
    <SidePanel
      title={isEdit ? "Business" : "New business"}
      onClose={onClose}
      footer={
        <div className="flex items-center justify-between gap-2">
          {isEdit ? (
            <button
              type="button"
              onClick={handleDelete}
              className="text-sm text-danger transition-colors hover:underline"
            >
              Remove
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button form={formId} type="submit" disabled={isPending} className="btn-primary">
              {isEdit ? "Save changes" : "Add business"}
            </button>
          </div>
        </div>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="px-5 py-5">
        <input
          name="name"
          defaultValue={business?.name}
          required
          placeholder="Business name"
          className="-mx-2 w-[calc(100%+1rem)] rounded-card border border-transparent bg-transparent px-2 py-1 text-2xl font-semibold tracking-tight text-ink transition-colors placeholder:text-ink-faint hover:bg-hover focus:border-line focus:bg-surface focus:outline-none"
        />

        <div className="mt-5 space-y-0.5">
          <Row label="Stage">
            <select
              name="stage"
              defaultValue={business?.stage ?? "PROSPECTING"}
              className="field-bare"
            >
              <option value="PROSPECTING">Prospecting</option>
              <option value="CONTACTED">Contacted</option>
              <option value="NEGOTIATING">Negotiating</option>
              <option value="WON">Won</option>
              <option value="LOST">Lost</option>
            </select>
          </Row>

          <Row label="Owner">
            <select name="ownerId" defaultValue={business?.ownerId ?? ""} className="field-bare">
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </Row>

          <Row label="Deal value (BDT)">
            <input
              type="number"
              name="value"
              defaultValue={business?.value ?? ""}
              min={0}
              step="0.01"
              placeholder="0"
              className="field-bare"
            />
          </Row>

          <Row label="Contact name">
            <input
              name="contactName"
              defaultValue={business?.contactName ?? ""}
              placeholder="Empty"
              className="field-bare"
            />
          </Row>

          <Row label="Contact email">
            <input
              type="email"
              name="contactEmail"
              defaultValue={business?.contactEmail ?? ""}
              placeholder="Empty"
              className="field-bare"
            />
          </Row>

          <Row label="Contact phone">
            <input
              name="contactPhone"
              defaultValue={business?.contactPhone ?? ""}
              placeholder="Empty"
              className="field-bare"
            />
          </Row>

          <Row label="Project / event">
            <select name="projectId" defaultValue={business?.projectId ?? ""} className="field-bare">
              <option value="">None</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Row>

          {isEdit && business && (
            <Row label="Linked tasks">
              <span className="px-2 py-1 text-sm text-ink-muted">
                {business.tasks.length} task{business.tasks.length === 1 ? "" : "s"}
              </span>
            </Row>
          )}
        </div>

        <div className="divider my-5" />

        <div>
          <span className="field-label mb-1 block">Notes</span>
          <textarea
            name="notes"
            defaultValue={business?.notes ?? ""}
            rows={5}
            className="field-bare resize-none"
            placeholder="What they are interested in, objections, next step…"
          />
        </div>
      </form>
    </SidePanel>
  );
}
