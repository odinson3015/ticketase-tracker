"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { BusinessPanel } from "./BusinessPanel";
import { stageConfig } from "@/lib/labels";
import { PlusIcon } from "./icons";
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
      <div className="mb-6">
        <h1 className="page-title">Business pipeline</h1>
        <p className="mt-1.5 text-sm text-ink-muted">
          {filtered.length} business{filtered.length === 1 ? "" : "es"}
          {totalValue > 0 && " · ৳" + totalValue.toLocaleString() + " tracked"}
        </p>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="input-field w-40"
          aria-label="Filter by stage"
        >
          <option value="all">All stages</option>
          {Object.entries(stageConfig).map(([key, cfg]) => (
            <option key={key} value={key}>
              {cfg.label}
            </option>
          ))}
        </select>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <PlusIcon className="h-3.5 w-3.5" />
          New business
        </button>
      </div>

      <div className="table-wrap">
        <table className="table-base">
          <thead className="table-head">
            <tr>
              <th className="th">Name</th>
              <th className="th">Stage</th>
              <th className="th">Contact</th>
              <th className="th">Value</th>
              <th className="th">Owner</th>
              <th className="th">Updated</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => {
              const cfg = stageConfig[b.stage];
              return (
                <tr key={b.id} onClick={() => setOpenId(b.id)} className="table-row">
                  <td className="td">
                    <p className="font-medium text-ink">{b.name}</p>
                    {b.project && (
                      <p className="mt-0.5 text-xs text-ink-faint">{b.project.name}</p>
                    )}
                  </td>
                  <td className="td">
                    <span className={"pill " + cfg.pill}>{cfg.label}</span>
                  </td>
                  <td className="td text-ink-muted">
                    {b.contactName || <span className="text-ink-faint">&mdash;</span>}
                  </td>
                  <td className="td text-ink-muted">
                    {b.value ? (
                      "৳" + b.value.toLocaleString()
                    ) : (
                      <span className="text-ink-faint">&mdash;</span>
                    )}
                  </td>
                  <td className="td text-ink-muted">
                    {b.owner?.name || <span className="text-ink-faint">Unassigned</span>}
                  </td>
                  <td className="td text-ink-faint">{format(new Date(b.updatedAt), "MMM d")}</td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-10 text-center text-sm text-ink-faint">
                  No businesses here yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {(showCreate || selected) && (
        <BusinessPanel
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
