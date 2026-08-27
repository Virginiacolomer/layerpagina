import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  "Personajes",
  "Dioramas",
  "Funko Pop personalizados",
  "Llaveros",
  "Hogar y decoración",
  "Organizadores de escritorio",
  "Productos para eventos",
  "Juguetes para mascotas",
  "Comederos para mascotas",
];

function slugify(name: string) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name, slug: slugify(name) },
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
