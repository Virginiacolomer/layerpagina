import { PrismaClient } from "@prisma/client";
import { CATEGORIES } from "../src/lib/categories";

const prisma = new PrismaClient();

async function main() {
  for (const { name, slug } of CATEGORIES) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name, slug },
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
