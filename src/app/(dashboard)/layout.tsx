import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/Sidebar";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const projects = await prisma.project.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex min-h-screen flex-col bg-bg md:flex-row">
      <Suspense fallback={<div className="hidden w-60 shrink-0 border-r border-line bg-subtle md:block" />}>
        <Sidebar projects={projects} />
      </Suspense>
      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-5xl px-5 py-8 md:px-10 md:py-12">{children}</div>
      </main>
    </div>
  );
}
