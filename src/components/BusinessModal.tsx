"use client";

import { FormEvent, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createBusiness, updateBusiness, deleteBusiness } from "@/app/actions/businesses";
import { BusinessWithRelations, UserOption, ProjectOption } from "@/types";

export function BusinessModal({
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
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/40 px-4 py-10"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-card border border-line bg-surface shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold text-ink">
              {isEdit ? "Edit business" : "New business"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-ink-faint hover:text-ink"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Business name</label>
            <input
              name="name"
              defaultValue={business?.name}
              required
              className="input-field"
              placeholder="Cricket Frenzy Ltd."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Contact name</label>
              <input
                name="contactName"
                defaultValue={business?.contactName ?? ""}
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Stage</label>
              <select name="stage" defaultValue={business?.stage ?? "PROSPECTING"} className="input-field">
                <option value="PROSPECTING">Prospecting</option>
                <option value="CONTACTED">Contacted</option>
                <option value="NEGOTIATING">Negotiating</option>
                <option value="WON">Won</option>
                <option value="LOST">Lost</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Contact email</label>
              <input
                type="email"
                name="contactEmail"
                defaultValue={business?.contactEmail ?? ""}
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Contact phone</label>
              <input
                name="contactPhone"
                defaultValue={business?.contactPhone ?? ""}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Deal value (BDT)</label>
              <input
                type="number"
                name="value"
                defaultValue={business?.value ?? ""}
                min={0}
                step="0.01"
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Owner</label>
              <select name="ownerId" defaultValue={business?.ownerId ?? ""} className="input-field">
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Linked project / event</label>
            <select name="projectId" defaultValue={business?.projectId ?? ""} className="input-field">
              <option value="">None</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Notes</label>
            <textarea
              name="notes"
              defaultValue={business?.notes ?? ""}
              rows={3}
              className="input-field resize-none"
              placeholder="What they're interested in, objections, next step…"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {isEdit ? (
              <button
                type="button"
                onClick={handleDelete}
                className="text-sm text-danger hover:underline"
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
              <button type="submit" disabled={isPending} className="btn-primary">
                {isEdit ? "Save changes" : "Add business"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
