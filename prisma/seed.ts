import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.project.findFirst({ where: { name: "General" } });
  if (!existing) {
    await prisma.project.create({
      data: {
        name: "General",
        description: "Default project for tasks that aren't tied to a specific event or campaign.",
      },
    });
    console.log("Seeded default 'General' project.");
  } else {
    console.log("Default project already exists, skipping.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
