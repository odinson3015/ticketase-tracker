"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export type RegisterState = { error?: string; success?: boolean };

export async function registerUser(
  _prev: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "");
  const inviteCode = String(formData.get("inviteCode") || "");

  if (!name || !email || !password) {
    return { error: "Fill in your name, email, and password." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (inviteCode !== process.env.TEAM_INVITE_CODE) {
    return { error: "That invite code isn't right — check with your team lead." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with that email already exists. Try logging in instead." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { name, email, passwordHash },
  });

  return { success: true };
}
