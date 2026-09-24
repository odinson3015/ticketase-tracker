"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BusinessStage } from "@prisma/client";

async function requireUserId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Not signed in.");
  return session.user.id;
}

export async function createBusiness(formData: FormData) {
  const userId = await requireUserId();

  const name = String(formData.get("name") || "").trim();
  if (!name) throw new Error("Business name is required.");

  const contactName = String(formData.get("contactName") || "").trim() || null;
  const contactEmail = String(formData.get("contactEmail") || "").trim() || null;
  const contactPhone = String(formData.get("contactPhone") || "").trim() || null;
  const stage = String(formData.get("stage") || "PROSPECTING") as BusinessStage;
  const valueRaw = String(formData.get("value") || "");
  const notes = String(formData.get("notes") || "").trim() || null;
  const projectId = String(formData.get("projectId") || "") || null;
  const ownerId = String(formData.get("ownerId") || "") || userId;

  await prisma.business.create({
    data: {
      name,
      contactName,
      contactEmail,
      contactPhone,
      stage,
      value: valueRaw ? Number(valueRaw) : null,
      notes,
      projectId,
      ownerId,
    },
  });

  revalidatePath("/businesses");
  revalidatePath("/analytics");
}

export async function updateBusiness(businessId: string, formData: FormData) {
  await requireUserId();

  const name = String(formData.get("name") || "").trim();
  const contactName = String(formData.get("contactName") || "").trim() || null;
  const contactEmail = String(formData.get("contactEmail") || "").trim() || null;
  const contactPhone = String(formData.get("contactPhone") || "").trim() || null;
  const stage = String(formData.get("stage") || "PROSPECTING") as BusinessStage;
  const valueRaw = String(formData.get("value") || "");
  const notes = String(formData.get("notes") || "").trim() || null;
  const projectId = String(formData.get("projectId") || "") || null;
  const ownerId = String(formData.get("ownerId") || "") || null;

  await prisma.business.update({
    where: { id: businessId },
    data: {
      name,
      contactName,
      contactEmail,
      contactPhone,
      stage,
      value: valueRaw ? Number(valueRaw) : null,
      notes,
      projectId,
      ownerId,
    },
  });

  revalidatePath("/businesses");
  revalidatePath("/analytics");
}

export async function deleteBusiness(businessId: string) {
  await requireUserId();
  await prisma.business.delete({ where: { id: businessId } });
  revalidatePath("/businesses");
  revalidatePath("/analytics");
}
