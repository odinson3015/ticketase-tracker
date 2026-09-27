"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { createTask, updateTask, deleteTask, addComment } from "@/app/actions/tasks";
import { TaskWithRelations, UserOption, ProjectOption, BusinessOption } from "@/types";
import { SidePanel } from "./SidePanel";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** One row of the property list: label on the left, editable value on the right. */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 py-1 sm:flex-row sm:items-center sm:gap-3">
      <span className="field-label w-32 shrink-0">{label}</span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export function TaskPanel({
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
  const formId = "task-form";

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
    if (!confirm("Delete this task? This cannot be undone.")) return;
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
    <SidePanel
      title={isEdit ? "Task" : "New task"}
      onClose={onClose}
      footer={
        <div className="flex items-center justify-between gap-2">
          {isEdit ? (
            <button
              type="button"
              onClick={handleDelete}
              className="text-sm text-danger transition-colors hover:underline"
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
            <button form={formId} type="submit" disabled={isPending} className="btn-primary">
              {isEdit ? "Save changes" : "Create task"}
            </button>
          </div>
        </div>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="px-5 py-5">
        {/* Title, styled like a page heading */}
        <input
          name="title"
          defaultValue={task?.title}
          required
          placeholder="Untitled task"
          className="-mx-2 w-[calc(100%+1rem)] rounded-card border border-transparent bg-transparent px-2 py-1 text-2xl font-semibold tracking-tight text-ink transition-colors placeholder:text-ink-faint hover:bg-hover focus:border-line focus:bg-surface focus:outline-none"
        />

        {/* Properties */}
        <div className="mt-5 space-y-0.5">
          <Row label="Assignee">
            <select
              name="assigneeId"
              defaultValue={task?.assigneeId ?? ""}
              className="field-bare"
            >
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </Row>

          <Row label="Priority">
            <select
              name="priority"
              defaultValue={task?.priority ?? "MEDIUM"}
              className="field-bare"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </Row>

          <Row label="Due date">
            <input
              type="date"
              name="dueDate"
              defaultValue={task?.dueDate ? format(new Date(task.dueDate), "yyyy-MM-dd") : ""}
              className="field-bare"
            />
          </Row>

          <Row label="Project / event">
            <select name="projectId" defaultValue={task?.projectId ?? ""} className="field-bare">
              <option value="">None</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Row>

          <Row label="Business">
            <select name="businessId" defaultValue={task?.businessId ?? ""} className="field-bare">
              <option value="">None</option>
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </Row>

          {isEdit && task && (
            <Row label="Created by">
              <span className="px-2 py-1 text-sm text-ink-muted">
                {task.createdBy?.name ?? "—"} ·{" "}
                {format(new Date(task.createdAt), "MMM d, yyyy")}
              </span>
            </Row>
          )}
        </div>

        <div className="divider my-5" />

        <div>
          <span className="field-label mb-1 block">Description</span>
          <textarea
            name="description"
            defaultValue={task?.description ?? ""}
            rows={3}
            placeholder="Add more detail…"
            className="field-bare resize-none"
          />
        </div>
      </form>

      {isEdit && task && (
        <div className="border-t border-line px-5 py-5">
          <h3 className="section-title mb-3">
            Notes
            {task.comments.length > 0 ? " · " + task.comments.length : ""}
          </h3>
          <div className="mb-3 space-y-3">
            {task.comments.length === 0 && (
              <p className="text-sm text-ink-faint">No notes yet.</p>
            )}
            {task.comments.map((c) => (
              <div key={c.id} className="flex gap-2.5 text-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-chip text-[10px] font-medium text-ink-muted">
                  {initials(c.author.name)}
                </span>
                <div className="min-w-0">
                  <p className="whitespace-pre-wrap break-words text-ink">{c.content}</p>
                  <p className="mt-0.5 text-xs text-ink-faint">
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
    </SidePanel>
  );
}
