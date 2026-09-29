"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function setEmailNotifications(enabled: boolean) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Not signed in.");

  await prisma.user.update({
    where: { id: session.user.id },
    data: { emailNotifications: enabled },
  });

  revalidatePath("/settings");
}
