"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format } from "date-fns";

type StatusDatum = { status: string; count: number };
type AssigneeDatum = { name: string; open: number };
type OverdueTask = {
  id: string;
  title: string;
  assignee: string;
  project: string | null;
  dueDate: string;
  daysOverdue: number;
};

export function AnalyticsCharts({
  totalTasks,
  completionRate,
  overdueCount,
  dueThisWeek,
  statusData,
  assigneeData,
  overdueTasks,
}: {
  totalTasks: number;
  completionRate: number;
  overdueCount: number;
  dueThisWeek: number;
  statusData: StatusDatum[];
  assigneeData: AssigneeDatum[];
  overdueTasks: OverdueTask[];
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total tasks" value={String(totalTasks)} />
        <StatCard label="Completion rate" value={`${completionRate}%`} tone="success" />
        <StatCard
          label="Overdue"
          value={String(overdueCount)}
          tone={overdueCount > 0 ? "danger" : undefined}
        />
        <StatCard label="Due this week" value={String(dueThisWeek)} tone="accent" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-4 text-sm font-medium text-ink">Tasks by status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={statusData} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4E1D8" horizontal={false} />
              <XAxis type="number" allowDecimals={false} stroke="#8B8FA3" fontSize={12} />
              <YAxis type="category" dataKey="status" stroke="#8B8FA3" fontSize={12} width={90} />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #E4E1D8",
                  fontSize: 13,
                }}
              />
              <Bar dataKey="count" fill="#3B3FA1" radius={[0, 4, 4, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="mb-4 text-sm font-medium text-ink">Open tasks by person</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={assigneeData} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4E1D8" horizontal={false} />
              <XAxis type="number" allowDecimals={false} stroke="#8B8FA3" fontSize={12} />
              <YAxis type="category" dataKey="name" stroke="#8B8FA3" fontSize={12} width={90} />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #E4E1D8",
                  fontSize: 13,
                }}
              />
              <Bar dataKey="open" fill="#E8963C" radius={[0, 4, 4, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="mb-4 text-sm font-medium text-ink">Overdue tasks</h3>
        {overdueTasks.length === 0 ? (
          <p className="text-sm text-ink-faint">Nothing overdue. Good shape.</p>
        ) : (
          <div className="divide-y divide-line">
            {overdueTasks.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-2.5 text-sm">
                <div>
                  <p className="font-medium text-ink">{t.title}</p>
                  <p className="text-xs text-ink-faint">
                    {t.assignee}
                    {t.project ? ` · ${t.project}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-danger">{format(new Date(t.dueDate), "MMM d")}</p>
                  <p className="text-xs text-ink-faint">
                    {t.daysOverdue} day{t.daysOverdue === 1 ? "" : "s"} overdue
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "success" | "danger" | "accent";
}) {
  const toneClass =
    tone === "success"
      ? "text-success"
      : tone === "danger"
        ? "text-danger"
        : tone === "accent"
          ? "text-accent"
          : "text-ink";
  return (
    <div className="card p-4">
      <p className="text-xs text-ink-muted">{label}</p>
      <p className={`mt-1 font-heading text-2xl font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}
