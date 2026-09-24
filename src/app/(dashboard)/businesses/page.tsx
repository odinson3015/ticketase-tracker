import { prisma } from "@/lib/prisma";
import { BusinessTable } from "@/components/BusinessTable";

export const dynamic = "force-dynamic";

export default async function BusinessesPage() {
  const [businesses, users, projects] = await Promise.all([
    prisma.business.findMany({
      include: { owner: true, project: true, tasks: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.user.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.project.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return <BusinessTable businesses={businesses} users={users} projects={projects} />;
}
