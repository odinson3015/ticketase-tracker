import { format, isPast, isToday } from "date-fns";
import { TaskWithRelations } from "@/types";
import { priorityConfig } from "@/lib/labels";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function TaskCard({
  task,
  onOpen,
}: {
  task: TaskWithRelations;
  onOpen: () => void;
}) {
  const priority = priorityConfig[task.priority];
  const due = task.dueDate ? new Date(task.dueDate) : null;
  const overdue = due && task.status !== "DONE" && isPast(due) && !isToday(due);

  return (
    <button
      onClick={onOpen}
      className="card w-full space-y-2.5 p-3.5 text-left transition-shadow hover:shadow-none"
      style={{
        borderLeft: `3px solid ${
          task.priority === "HIGH"
            ? "#C1543C"
            : task.priority === "MEDIUM"
              ? "#E8963C"
              : "#E4E1D8"
        }`,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-snug text-ink">{task.title}</p>
      </div>

      {(task.project || task.business) && (
        <div className="flex flex-wrap gap-1.5">
          {task.project && (
            <span className="rounded bg-bg px-1.5 py-0.5 text-xs text-ink-muted">
              {task.project.name}
            </span>
          )}
          {task.business && (
            <span className="rounded bg-accent-light px-1.5 py-0.5 text-xs text-accent">
              {task.business.name}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-ink-muted">
        <div className="flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 rounded-full ${priority.dot}`} />
          <span className={priority.text}>{priority.label}</span>
        </div>
        {due && (
          <span className={overdue ? "font-medium text-danger" : ""}>
            {overdue ? "Overdue · " : ""}
            {format(due, "MMM d")}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        {task.assignee ? (
          <span
            title={task.assignee.name}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-light text-[10px] font-medium text-primary"
          >
            {initials(task.assignee.name)}
          </span>
        ) : (
          <span className="text-xs text-ink-faint">Unassigned</span>
        )}
        {task.comments.length > 0 && (
          <span className="text-xs text-ink-faint">{task.comments.length} note{task.comments.length === 1 ? "" : "s"}</span>
        )}
      </div>
    </button>
  );
}
