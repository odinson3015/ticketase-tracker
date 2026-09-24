"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TaskStatus } from "@prisma/client";
import { updateTaskStatus } from "@/app/actions/tasks";
import { createProject } from "@/app/actions/projects";
import { TaskCard } from "./TaskCard";
import { TaskModal } from "./TaskModal";
import { statusLabels } from "@/lib/labels";
import { TaskWithRelations, UserOption, ProjectOption, BusinessOption } from "@/types";

const columns: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];

export function TaskBoard({
  tasks,
  users,
  projects,
  businesses,
}: {
  tasks: TaskWithRelations[];
  users: UserOption[];
  projects: ProjectOption[];
  businesses: BusinessOption[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [projectFilter, setProjectFilter] = useState("all");

  const filtered = useMemo(
    () =>
      projectFilter === "all"
        ? tasks
        : tasks.filter((t) => t.projectId === projectFilter),
    [tasks, projectFilter]
  );

  const selectedTask = tasks.find((t) => t.id === openTaskId);

  function handleNewProject() {
    const name = window.prompt("Project or event name (e.g. HCD 2026):");
    if (!name || !name.trim()) return;
    const formData = new FormData();
    formData.set("name", name.trim());
    startTransition(async () => {
      await createProject(formData);
      router.refresh();
    });
  }

  function move(taskId: string, status: TaskStatus) {
    startTransition(async () => {
      await updateTaskStatus(taskId, status);
      router.refresh();
    });
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-ink">Task board</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {filtered.length} task{filtered.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="input-field w-44"
          >
            <option value="all">All projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <button onClick={handleNewProject} className="btn-secondary">
            + New project
          </button>
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            + New task
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {columns.map((status, colIndex) => {
          const colTasks = filtered.filter((t) => t.status === status);
          return (
            <div key={status} className="rounded-card bg-line/30 p-3">
              <div className="mb-3 flex items-center justify-between px-1">
                <h2 className="text-sm font-medium text-ink">{statusLabels[status]}</h2>
                <span className="text-xs text-ink-faint">{colTasks.length}</span>
              </div>
              <div className="space-y-2.5">
                {colTasks.map((task) => (
                  <div key={task.id} className="space-y-1">
                    <TaskCard task={task} onOpen={() => setOpenTaskId(task.id)} />
                    <div className="flex justify-end gap-2 px-1 text-xs">
                      {colIndex > 0 && (
                        <button
                          onClick={() => move(task.id, columns[colIndex - 1])}
                          className="text-ink-faint hover:text-primary"
                        >
                          ← {statusLabels[columns[colIndex - 1]]}
                        </button>
                      )}
                      {colIndex < columns.length - 1 && (
                        <button
                          onClick={() => move(task.id, columns[colIndex + 1])}
                          className="text-ink-faint hover:text-primary"
                        >
                          {statusLabels[columns[colIndex + 1]]} →
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {colTasks.length === 0 && (
                  <p className="px-1 text-xs text-ink-faint">Nothing here.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {(showCreate || selectedTask) && (
        <TaskModal
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
