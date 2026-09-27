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
      className="w-full rounded-card border border-line bg-surface px-3 py-2.5 text-left transition-colors hover:bg-hover"
    >
      <p className="text-sm font-medium leading-snug text-ink">{task.title}</p>

      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-ink-muted">
        {task.assignee ? (
          <span className="inline-flex items-center gap-1.5">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-chip text-[9px] font-medium text-ink-muted">
              {initials(task.assignee.name)}
            </span>
            {task.assignee.name}
          </span>
        ) : (
          <span className="text-ink-faint">Unassigned</span>
        )}

        {due && (
          <>
            <span className="text-ink-faint">·</span>
            <span className={overdue ? "font-medium text-danger" : ""}>
              {format(due, "MMM d")}
            </span>
          </>
        )}

        {task.comments.length > 0 && (
          <>
            <span className="text-ink-faint">·</span>
            <span>
              {task.comments.length} note{task.comments.length === 1 ? "" : "s"}
            </span>
          </>
        )}
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <span className={"pill " + priority.pill}>{priority.label}</span>
        {task.project && <span className="pill pill-grey">{task.project.name}</span>}
        {task.business && <span className="pill pill-grey">{task.business.name}</span>}
      </div>
    </button>
  );
}
