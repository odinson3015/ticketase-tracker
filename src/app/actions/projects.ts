"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function createProject(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Not signed in.");

  const name = String(formData.get("name") || "").trim();
  if (!name) throw new Error("Project name is required.");
  const description = String(formData.get("description") || "").trim() || null;

  await prisma.project.create({ data: { name, description } });

  revalidatePath("/board");
  revalidatePath("/businesses");
}
