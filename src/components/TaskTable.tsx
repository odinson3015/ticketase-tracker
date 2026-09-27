"use client";

import { format, isPast, isToday } from "date-fns";
import { TaskWithRelations } from "@/types";
import { priorityConfig, statusConfig } from "@/lib/labels";

/** Spreadsheet-like list of tasks, matching the businesses table style. */
export function TaskTable({
  tasks,
  onOpen,
}: {
  tasks: TaskWithRelations[];
  onOpen: (taskId: string) => void;
}) {
  return (
    <div className="table-wrap">
      <table className="table-base">
        <thead className="table-head">
          <tr>
            <th className="th">Title</th>
            <th className="th">Status</th>
            <th className="th">Assignee</th>
            <th className="th">Priority</th>
            <th className="th">Due date</th>
            <th className="th">Project</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const status = statusConfig[task.status];
            const priority = priorityConfig[task.priority];
            const due = task.dueDate ? new Date(task.dueDate) : null;
            const overdue = due && task.status !== "DONE" && isPast(due) && !isToday(due);

            return (
              <tr key={task.id} onClick={() => onOpen(task.id)} className="table-row">
                <td className="td font-medium text-ink">{task.title}</td>
                <td className="td">
                  <span className={"pill " + status.pill}>{status.label}</span>
                </td>
                <td className="td text-ink-muted">
                  {task.assignee?.name ?? <span className="text-ink-faint">Unassigned</span>}
                </td>
                <td className="td">
                  <span className={"pill " + priority.pill}>{priority.label}</span>
                </td>
                <td className="td whitespace-nowrap">
                  {due ? (
                    <span className={overdue ? "font-medium text-danger" : "text-ink-muted"}>
                      {format(due, "MMM d, yyyy")}
                    </span>
                  ) : (
                    <span className="text-ink-faint">&mdash;</span>
                  )}
                </td>
                <td className="td">
                  {task.project ? (
                    <span className="pill pill-grey">{task.project.name}</span>
                  ) : (
                    <span className="text-ink-faint">&mdash;</span>
                  )}
                </td>
              </tr>
            );
          })}
          {tasks.length === 0 && (
            <tr>
              <td colSpan={6} className="px-3 py-10 text-center text-sm text-ink-faint">
                No tasks here yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
