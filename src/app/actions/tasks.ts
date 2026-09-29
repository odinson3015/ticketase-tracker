"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyTaskAssigned, notifyTaskCompleted } from "@/lib/email";
import { Priority, TaskStatus } from "@prisma/client";

async function requireUserId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Not signed in.");
  return session.user.id;
}

export async function createTask(formData: FormData) {
  const userId = await requireUserId();

  const title = String(formData.get("title") || "").trim();
  if (!title) throw new Error("Title is required.");

  const description = String(formData.get("description") || "").trim() || null;
  const priority = String(formData.get("priority") || "MEDIUM") as Priority;
  const dueDateRaw = String(formData.get("dueDate") || "");
  const assigneeId = String(formData.get("assigneeId") || "") || null;
  const projectId = String(formData.get("projectId") || "") || null;
  const businessId = String(formData.get("businessId") || "") || null;

  const task = await prisma.task.create({
    data: {
      title,
      description,
      priority,
      dueDate: dueDateRaw ? new Date(dueDateRaw) : null,
      assigneeId,
      projectId,
      businessId,
      createdById: userId,
    },
  });

  if (assigneeId) {
    await notifyTaskAssigned({ taskId: task.id, assigneeId, actorId: userId });
  }

  revalidatePath("/board");
  revalidatePath("/analytics");
  revalidatePath("/dashboard");
}

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  const userId = await requireUserId();

  const before = await prisma.task.findUnique({
    where: { id: taskId },
    select: { status: true },
  });

  await prisma.task.update({ where: { id: taskId }, data: { status } });

  // Only on the move into Done, not on every save of an already-done task.
  if (status === "DONE" && before?.status !== "DONE") {
    await notifyTaskCompleted({ taskId, actorId: userId });
  }

  revalidatePath("/board");
  revalidatePath("/analytics");
  revalidatePath("/dashboard");
}

export async function updateTask(taskId: string, formData: FormData) {
  const userId = await requireUserId();

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const priority = String(formData.get("priority") || "MEDIUM") as Priority;
  const dueDateRaw = String(formData.get("dueDate") || "");
  const assigneeId = String(formData.get("assigneeId") || "") || null;
  const projectId = String(formData.get("projectId") || "") || null;
  const businessId = String(formData.get("businessId") || "") || null;

  const before = await prisma.task.findUnique({
    where: { id: taskId },
    select: { assigneeId: true },
  });

  await prisma.task.update({
    where: { id: taskId },
    data: {
      title,
      description,
      priority,
      dueDate: dueDateRaw ? new Date(dueDateRaw) : null,
      assigneeId,
      projectId,
      businessId,
    },
  });

  // Tell the new assignee, but only when the assignee actually changed.
  if (assigneeId && assigneeId !== before?.assigneeId) {
    await notifyTaskAssigned({ taskId, assigneeId, actorId: userId });
  }

  revalidatePath("/board");
  revalidatePath("/analytics");
  revalidatePath("/dashboard");
}

export async function deleteTask(taskId: string) {
  await requireUserId();
  await prisma.task.delete({ where: { id: taskId } });
  revalidatePath("/board");
  revalidatePath("/analytics");
  revalidatePath("/dashboard");
}

export async function addComment(taskId: string, formData: FormData) {
  const userId = await requireUserId();
  const content = String(formData.get("content") || "").trim();
  if (!content) return;

  await prisma.comment.create({
    data: { content, taskId, authorId: userId },
  });

  revalidatePath("/board");
}
