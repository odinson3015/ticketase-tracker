import { addDays, differenceInCalendarDays, isPast, isToday } from "date-fns";
import { prisma } from "@/lib/prisma";
import { AnalyticsCharts } from "@/components/AnalyticsCharts";
import { statusLabels } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const tasks = await prisma.task.findMany({
    include: { assignee: true, project: true },
  });

  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "DONE").length;
  const completionRate = total ? Math.round((done / total) * 100) : 0;

  const now = new Date();
  const weekAhead = addDays(now, 7);

  const overdue = tasks
    .filter((t) => t.dueDate && t.status !== "DONE" && isPast(t.dueDate) && !isToday(t.dueDate))
    .sort((a, b) => (a.dueDate! < b.dueDate! ? -1 : 1))
    .map((t) => ({
      id: t.id,
      title: t.title,
      assignee: t.assignee?.name ?? "Unassigned",
      project: t.project?.name ?? null,
      dueDate: t.dueDate!.toISOString(),
      daysOverdue: differenceInCalendarDays(now, t.dueDate!),
    }));

  const dueThisWeek = tasks.filter(
    (t) => t.dueDate && t.status !== "DONE" && t.dueDate >= now && t.dueDate <= weekAhead
  ).length;

  const statusData = (["TODO", "IN_PROGRESS", "DONE"] as const).map((status) => ({
    status: statusLabels[status],
    count: tasks.filter((t) => t.status === status).length,
  }));

  const assigneeMap = new Map<string, number>();
  for (const t of tasks) {
    if (t.status === "DONE") continue;
    const name = t.assignee?.name ?? "Unassigned";
    assigneeMap.set(name, (assigneeMap.get(name) ?? 0) + 1);
  }
  const assigneeData = Array.from(assigneeMap.entries())
    .map(([name, open]) => ({ name, open }))
    .sort((a, b) => b.open - a.open);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold text-ink">Analytics</h1>
        <p className="mt-1 text-sm text-ink-muted">How the team is tracking, at a glance.</p>
      </div>
      <AnalyticsCharts
        totalTasks={total}
        completionRate={completionRate}
        overdueCount={overdue.length}
        dueThisWeek={dueThisWeek}
        statusData={statusData}
        assigneeData={assigneeData}
        overdueTasks={overdue}
      />
    </div>
  );
}
