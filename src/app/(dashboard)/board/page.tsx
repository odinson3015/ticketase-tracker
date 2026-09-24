import { prisma } from "@/lib/prisma";
import { TaskBoard } from "@/components/TaskBoard";

export const dynamic = "force-dynamic";

export default async function BoardPage() {
  const [tasks, users, projects, businesses] = await Promise.all([
    prisma.task.findMany({
      include: {
        assignee: true,
        createdBy: true,
        project: true,
        business: true,
        comments: { include: { author: true }, orderBy: { createdAt: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.project.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.business.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return <TaskBoard tasks={tasks} users={users} projects={projects} businesses={businesses} />;
}
