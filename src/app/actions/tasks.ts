"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

  await prisma.task.create({
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

  revalidatePath("/board");
  revalidatePath("/analytics");
}

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  await requireUserId();
  await prisma.task.update({ where: { id: taskId }, data: { status } });
  revalidatePath("/board");
  revalidatePath("/analytics");
}

export async function updateTask(taskId: string, formData: FormData) {
  await requireUserId();

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const priority = String(formData.get("priority") || "MEDIUM") as Priority;
  const dueDateRaw = String(formData.get("dueDate") || "");
  const assigneeId = String(formData.get("assigneeId") || "") || null;
  const projectId = String(formData.get("projectId") || "") || null;
  const businessId = String(formData.get("businessId") || "") || null;

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

  revalidatePath("/board");
  revalidatePath("/analytics");
}

export async function deleteTask(taskId: string) {
  await requireUserId();
  await prisma.task.delete({ where: { id: taskId } });
  revalidatePath("/board");
  revalidatePath("/analytics");
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
