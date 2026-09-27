"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format } from "date-fns";
import { useTheme } from "./ThemeProvider";

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
  const { theme } = useTheme();
  const dark = theme === "dark";

  // Quiet, near-neutral chart colours that work in both themes.
  const grid = dark ? "#323232" : "#E8E8E5";
  const axis = dark ? "#7A7A78" : "#9B9A97";
  const barA = dark ? "#6F73D6" : "#8C8FD8";
  const barB = dark ? "#5C5C5C" : "#C9C8C4";
  const tooltipStyle = {
    borderRadius: 4,
    border: "1px solid " + grid,
    background: dark ? "#232323" : "#FFFFFF",
    color: dark ? "#E9E9E7" : "#191919",
    fontSize: 13,
  };

  return (
    <div className="space-y-8">
      {/* Plain stat row */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-5 border-b border-line pb-6 md:grid-cols-4">
        <Stat label="Total tasks" value={String(totalTasks)} />
        <Stat label="Completion rate" value={completionRate + "%"} />
        <Stat label="Overdue" value={String(overdueCount)} emphasis={overdueCount > 0} />
        <Stat label="Due this week" value={String(dueThisWeek)} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h3 className="section-title mb-3">Tasks by status</h3>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={statusData} layout="vertical" margin={{ left: 0, right: 8 }}>
              <CartesianGrid stroke={grid} horizontal={false} />
              <XAxis
                type="number"
                allowDecimals={false}
                stroke={axis}
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: grid }}
              />
              <YAxis
                type="category"
                dataKey="status"
                stroke={axis}
                fontSize={12}
                width={88}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                cursor={{ fill: dark ? "#2C2C2C" : "#F1F1EF" }}
              />
              <Bar dataKey="count" fill={barA} radius={[0, 2, 2, 0]} barSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h3 className="section-title mb-3">Open tasks by person</h3>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={assigneeData} layout="vertical" margin={{ left: 0, right: 8 }}>
              <CartesianGrid stroke={grid} horizontal={false} />
              <XAxis
                type="number"
                allowDecimals={false}
                stroke={axis}
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: grid }}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke={axis}
                fontSize={12}
                width={88}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                cursor={{ fill: dark ? "#2C2C2C" : "#F1F1EF" }}
              />
              <Bar dataKey="open" fill={barB} radius={[0, 2, 2, 0]} barSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="section-title mb-3">Overdue tasks</h3>
        {overdueTasks.length === 0 ? (
          <p className="text-sm text-ink-faint">Nothing overdue. Good shape.</p>
        ) : (
          <div className="divide-y divide-line border-t border-line">
            {overdueTasks.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between gap-4 py-2.5 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{t.title}</p>
                  <p className="mt-0.5 text-xs text-ink-faint">
                    {t.assignee}
                    {t.project ? " · " + t.project : ""}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-danger">{format(new Date(t.dueDate), "MMM d")}</p>
                  <p className="mt-0.5 text-xs text-ink-faint">
                    {t.daysOverdue} day{t.daysOverdue === 1 ? "" : "s"} late
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

function Stat({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">{label}</p>
      <p
        className={
          "mt-1 text-3xl font-semibold tracking-tight " +
          (emphasis ? "text-danger" : "text-ink")
        }
      >
        {value}
      </p>
    </div>
  );
}
