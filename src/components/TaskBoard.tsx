"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TaskStatus } from "@prisma/client";
import { updateTaskStatus } from "@/app/actions/tasks";
import { TaskCard } from "./TaskCard";
import { TaskTable } from "./TaskTable";
import { TaskPanel } from "./TaskPanel";
import { statusLabels } from "@/lib/labels";
import { ArrowLeftIcon, ArrowRightIcon, BoardIcon, PlusIcon, TableIcon } from "./icons";
import { TaskWithRelations, UserOption, ProjectOption, BusinessOption } from "@/types";

const columns: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];

type View = "board" | "table";
const VIEW_STORAGE_KEY = "tracker-board-view";

export function TaskBoard({
  tasks,
  users,
  projects,
  businesses,
  initialProjectId,
}: {
  tasks: TaskWithRelations[];
  users: UserOption[];
  projects: ProjectOption[];
  businesses: BusinessOption[];
  initialProjectId?: string;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [projectFilter, setProjectFilter] = useState(initialProjectId ?? "all");
  const [view, setView] = useState<View>("board");

  // Remember the chosen view in the browser.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(VIEW_STORAGE_KEY);
      if (saved === "board" || saved === "table") setView(saved);
    } catch {
      // storage unavailable — stay on the default view
    }
  }, []);

  function chooseView(next: View) {
    setView(next);
    try {
      window.localStorage.setItem(VIEW_STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }

  // Keep in step with the project picked in the sidebar.
  useEffect(() => {
    setProjectFilter(initialProjectId ?? "all");
  }, [initialProjectId]);

  const filtered = useMemo(
    () =>
      projectFilter === "all" ? tasks : tasks.filter((t) => t.projectId === projectFilter),
    [tasks, projectFilter]
  );

  const selectedTask = tasks.find((t) => t.id === openTaskId);
  const activeProjectName = projects.find((p) => p.id === projectFilter)?.name;

  function move(taskId: string, status: TaskStatus) {
    startTransition(async () => {
      await updateTaskStatus(taskId, status);
      router.refresh();
    });
  }

  return (
    <div>
      {/* Page heading */}
      <div className="mb-6">
        <h1 className="page-title">{activeProjectName ?? "Task board"}</h1>
        <p className="mt-1.5 text-sm text-ink-muted">
          {filtered.length} task{filtered.length === 1 ? "" : "s"}
          {activeProjectName ? " in this project" : " across the team"}
        </p>
      </div>

      {/* View toggle + controls */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => chooseView("board")}
            className={
              "inline-flex items-center gap-1.5 rounded-card px-2 py-1 text-sm font-medium transition-colors " +
              (view === "board"
                ? "bg-hover text-ink"
                : "text-ink-muted hover:bg-hover hover:text-ink")
            }
          >
            <BoardIcon className="h-3.5 w-3.5" />
            Board
          </button>
          <button
            type="button"
            onClick={() => chooseView("table")}
            className={
              "inline-flex items-center gap-1.5 rounded-card px-2 py-1 text-sm font-medium transition-colors " +
              (view === "table"
                ? "bg-hover text-ink"
                : "text-ink-muted hover:bg-hover hover:text-ink")
            }
          >
            <TableIcon className="h-3.5 w-3.5" />
            Table
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="input-field w-40"
            aria-label="Filter by project"
          >
            <option value="all">All projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            <PlusIcon className="h-3.5 w-3.5" />
            New task
          </button>
        </div>
      </div>

      {view === "table" ? (
        <TaskTable tasks={filtered} onOpen={(id) => setOpenTaskId(id)} />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {columns.map((status, colIndex) => {
            const colTasks = filtered.filter((t) => t.status === status);
            return (
              <div key={status}>
                <div className="mb-2 flex items-center gap-2 px-1">
                  <h2 className="section-title">{statusLabels[status]}</h2>
                  <span className="text-xs text-ink-faint">{colTasks.length}</span>
                </div>
                <div className="space-y-2">
                  {colTasks.map((task) => (
                    <div key={task.id}>
                      <TaskCard task={task} onOpen={() => setOpenTaskId(task.id)} />
                      <div className="flex justify-end gap-1 pt-0.5">
                        {colIndex > 0 && (
                          <button
                            onClick={() => move(task.id, columns[colIndex - 1])}
                            className="inline-flex items-center gap-0.5 rounded-card px-1.5 py-0.5 text-xs text-ink-faint transition-colors hover:bg-hover hover:text-ink"
                            title={"Move to " + statusLabels[columns[colIndex - 1]]}
                          >
                            <ArrowLeftIcon />
                            {statusLabels[columns[colIndex - 1]]}
                          </button>
                        )}
                        {colIndex < columns.length - 1 && (
                          <button
                            onClick={() => move(task.id, columns[colIndex + 1])}
                            className="inline-flex items-center gap-0.5 rounded-card px-1.5 py-0.5 text-xs text-ink-faint transition-colors hover:bg-hover hover:text-ink"
                            title={"Move to " + statusLabels[columns[colIndex + 1]]}
                          >
                            {statusLabels[columns[colIndex + 1]]}
                            <ArrowRightIcon />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {colTasks.length === 0 && (
                    <p className="rounded-card border border-dashed border-line px-3 py-4 text-center text-xs text-ink-faint">
                      Nothing here.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {(showCreate || selectedTask) && (
        <TaskPanel
          task={selectedTask}
          users={users}
          projects={projects}
          businesses={businesses}
          onClose={() => {
            setShowCreate(false);
            setOpenTaskId(null);
          }}
        />
      )}
    </div>
  );
}
