"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { createTask, updateTask, deleteTask, addComment } from "@/app/actions/tasks";
import { TaskWithRelations, UserOption, ProjectOption, BusinessOption } from "@/types";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function TaskModal({
  task,
  users,
  projects,
  businesses,
  onClose,
}: {
  task?: TaskWithRelations;
  users: UserOption[];
  projects: ProjectOption[];
  businesses: BusinessOption[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [commentText, setCommentText] = useState("");
  const isEdit = Boolean(task);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      if (task) {
        await updateTask(task.id, formData);
      } else {
        await createTask(formData);
      }
      router.refresh();
      onClose();
    });
  }

  function handleDelete() {
    if (!task) return;
    if (!confirm("Delete this task? This can't be undone.")) return;
    startTransition(async () => {
      await deleteTask(task.id);
      router.refresh();
      onClose();
    });
  }

  function handleAddComment(e: FormEvent) {
    e.preventDefault();
    if (!task || !commentText.trim()) return;
    const formData = new FormData();
    formData.set("content", commentText);
    startTransition(async () => {
      await addComment(task.id, formData);
      setCommentText("");
      router.refresh();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/40 px-4 py-10"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-card border border-line bg-surface shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold text-ink">
              {isEdit ? "Edit task" : "New task"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-ink-faint hover:text-ink"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Title</label>
            <input
              name="title"
              defaultValue={task?.title}
              required
              className="input-field"
              placeholder="Follow up with venue on contract"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Description</label>
            <textarea
              name="description"
              defaultValue={task?.description ?? ""}
              rows={2}
              className="input-field resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Assignee</label>
              <select
                name="assigneeId"
                defaultValue={task?.assigneeId ?? ""}
                className="input-field"
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Priority</label>
              <select
                name="priority"
                defaultValue={task?.priority ?? "MEDIUM"}
                className="input-field"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Due date</label>
              <input
                type="date"
                name="dueDate"
                defaultValue={task?.dueDate ? format(new Date(task.dueDate), "yyyy-MM-dd") : ""}
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Project / event</label>
              <select
                name="projectId"
                defaultValue={task?.projectId ?? ""}
                className="input-field"
              >
                <option value="">None</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink">
              Linked business (optional)
            </label>
            <select
              name="businessId"
              defaultValue={task?.businessId ?? ""}
              className="input-field"
            >
              <option value="">None</option>
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between pt-2">
            {isEdit ? (
              <button
                type="button"
                onClick={handleDelete}
                className="text-sm text-danger hover:underline"
              >
                Delete task
              </button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={isPending} className="btn-primary">
                {isEdit ? "Save changes" : "Create task"}
              </button>
            </div>
          </div>
        </form>

        {isEdit && task && (
          <div className="border-t border-line p-6">
            <h3 className="mb-3 text-sm font-medium text-ink">Notes</h3>
            <div className="mb-3 max-h-48 space-y-3 overflow-y-auto">
              {task.comments.length === 0 && (
                <p className="text-sm text-ink-faint">No notes yet.</p>
              )}
              {task.comments.map((c) => (
                <div key={c.id} className="flex gap-2.5 text-sm">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-light text-[10px] font-medium text-primary">
                    {initials(c.author.name)}
                  </span>
                  <div>
                    <p className="text-ink">{c.content}</p>
                    <p className="text-xs text-ink-faint">
                      {c.author.name} · {format(new Date(c.createdAt), "MMM d, h:mm a")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a note…"
                className="input-field"
              />
              <button type="submit" disabled={isPending} className="btn-secondary shrink-0">
                Add
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
