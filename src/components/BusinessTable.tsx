"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { BusinessModal } from "./BusinessModal";
import { stageConfig } from "@/lib/labels";
import { BusinessWithRelations, UserOption, ProjectOption } from "@/types";

export function BusinessTable({
  businesses,
  users,
  projects,
}: {
  businesses: BusinessWithRelations[];
  users: UserOption[];
  projects: ProjectOption[];
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [stageFilter, setStageFilter] = useState("all");

  const filtered = useMemo(
    () =>
      stageFilter === "all" ? businesses : businesses.filter((b) => b.stage === stageFilter),
    [businesses, stageFilter]
  );

  const selected = businesses.find((b) => b.id === openId);

  const totalValue = filtered.reduce((sum, b) => sum + (b.value ?? 0), 0);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-ink">Business pipeline</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {filtered.length} business{filtered.length === 1 ? "" : "es"}
            {totalValue > 0 && ` · ৳${totalValue.toLocaleString()} tracked`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="input-field w-44"
          >
            <option value="all">All stages</option>
            {Object.entries(stageConfig).map(([key, cfg]) => (
              <option key={key} value={key}>
                {cfg.label}
              </option>
            ))}
          </select>
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            + New business
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-bg text-xs uppercase tracking-wide text-ink-faint">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Stage</th>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Value</th>
              <th className="px-4 py-3 font-medium">Owner</th>
              <th className="px-4 py-3 font-medium">Updated</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => {
              const cfg = stageConfig[b.stage];
              return (
                <tr
                  key={b.id}
                  onClick={() => setOpenId(b.id)}
                  className="cursor-pointer border-b border-line last:border-0 hover:bg-bg"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">{b.name}</p>
                    {b.project && <p className="text-xs text-ink-faint">{b.project.name}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.text}`}
                    >
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-muted">
                    {b.contactName || <span className="text-ink-faint">—</span>}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">
                    {b.value ? `৳${b.value.toLocaleString()}` : <span className="text-ink-faint">—</span>}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">
                    {b.owner?.name || <span className="text-ink-faint">Unassigned</span>}
                  </td>
                  <td className="px-4 py-3 text-ink-faint">
                    {format(new Date(b.updatedAt), "MMM d")}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-ink-faint">
                  No businesses here yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {(showCreate || selected) && (
        <BusinessModal
          business={selected}
          users={users}
          projects={projects}
          onClose={() => {
            setShowCreate(false);
            setOpenId(null);
          }}
        />
      )}
    </div>
  );
}
