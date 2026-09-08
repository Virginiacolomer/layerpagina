import { PrismaClient } from "@prisma/client";
import { CATEGORIES } from "../src/lib/categories";

const prisma = new PrismaClient();

type SeedVariant = { name: string; value: string; priceModifier: number; stock: number };
type SeedProduct = {
  slug: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  categorySlug: string;
  variants: SeedVariant[];
};

// Catálogo de ejemplo para arrancar. El admin puede editarlos o borrarlos desde
// /admin/productos. Re-correr el seed es idempotente (upsert por slug).
const PRODUCTS: SeedProduct[] = [
  {
    slug: "busto-iron-man",
    name: "Busto Iron Man",
    description:
      "Busto articulado de Iron Man impreso en resina y pintado a mano, con detalles de luces LED en el arc reactor. Pieza de colección.",
    price: 42000,
    stock: 3,
    categorySlug: "personajes",
    variants: [],
  },
  {
    slug: "diorama-rick-y-morty",
    name: "Diorama Rick y Morty",
    description:
      "Diorama de Rick y Morty sobre base rocosa con tentáculos, pintado a mano con acabado mate. Incluye base con nombre personalizable.",
    price: 38000,
    stock: 2,
    categorySlug: "dioramas",
    variants: [
      { name: "Base", value: "Con nombre grabado", priceModifier: 2000, stock: 2 },
      { name: "Base", value: "Sin grabado", priceModifier: 0, stock: 4 },
    ],
  },
  {
    slug: "funko-personalizado",
    name: "Funko Pop personalizado",
    description:
      "Tu Funko Pop a medida, hecho a partir de una foto tuya o de la persona que quieras regalar. Elegí el color de piel y outfit.",
    price: 15000,
    stock: 10,
    categorySlug: "funko-pop-personalizados",
    variants: [
      { name: "Tamaño", value: "Estándar (10cm)", priceModifier: 0, stock: 10 },
      { name: "Tamaño", value: "Grande (15cm)", priceModifier: 6000, stock: 5 },
    ],
  },
  {
    slug: "llavero-logo-personalizado",
    name: "Llavero con logo personalizado",
    description:
      "Llavero impreso en PLA resistente con el logo, iniciales o texto que quieras. Ideal para regalos de eventos o merchandising.",
    price: 3500,
    stock: 50,
    categorySlug: "llaveros",
    variants: [
      { name: "Color", value: "Naranja", priceModifier: 0, stock: 20 },
      { name: "Color", value: "Negro", priceModifier: 0, stock: 20 },
      { name: "Color", value: "Blanco", priceModifier: 0, stock: 10 },
    ],
  },
  {
    slug: "maceta-geometrica",
    name: "Maceta geométrica",
    description:
      "Maceta decorativa de diseño geométrico para plantas chicas, con plato incluido. Ideal para escritorio o repisa.",
    price: 9500,
    stock: 15,
    categorySlug: "hogar-y-decoracion",
    variants: [
      { name: "Color", value: "Blanco", priceModifier: 0, stock: 8 },
      { name: "Color", value: "Gris", priceModifier: 0, stock: 7 },
    ],
  },
  {
    slug: "organizador-escritorio-modular",
    name: "Organizador de escritorio modular",
    description:
      "Set modular para organizar lápices, clips y accesorios de escritorio. Módulos apilables para armar tu propia configuración.",
    price: 12000,
    stock: 8,
    categorySlug: "organizadores-de-escritorio",
    variants: [],
  },
  {
    slug: "souvenirs-cumple-x10",
    name: "Souvenirs para eventos (pack x10)",
    description:
      "Pack de 10 souvenirs personalizados con el motivo, color y texto que elijas. Perfecto para cumpleaños o eventos temáticos.",
    price: 18000,
    stock: 6,
    categorySlug: "productos-para-eventos",
    variants: [],
  },
  {
    slug: "juguete-dispensador-mascotas",
    name: "Juguete dispensador para mascotas",
    description:
      "Juguete interactivo que dispensa premios mientras tu mascota juega. Resistente a mordidas, en PLA+ apto para uso con mascotas.",
    price: 11000,
    stock: 12,
    categorySlug: "juguetes-para-mascotas",
    variants: [],
  },
  {
    slug: "comedero-doble-antideslizante",
    name: "Comedero doble antideslizante",
    description:
      "Comedero doble para agua y comida, con base antideslizante. Fácil de limpiar y disponible en distintos tamaños según tu mascota.",
    price: 13500,
    stock: 9,
    categorySlug: "comederos-para-mascotas",
    variants: [
      { name: "Tamaño", value: "Chico", priceModifier: 0, stock: 5 },
      { name: "Tamaño", value: "Grande", priceModifier: 2500, stock: 4 },
    ],
  },
];

async function main() {
  const categoryIdBySlug = new Map<string, string>();
  for (const { name, slug } of CATEGORIES) {
    const category = await prisma.category.upsert({
      where: { name },
      update: { slug },
      create: { name, slug },
    });
    categoryIdBySlug.set(slug, category.id);
  }

  for (const product of PRODUCTS) {
    const categoryId = categoryIdBySlug.get(product.categorySlug);
    if (!categoryId) throw new Error(`Categoría desconocida en seed: ${product.categorySlug}`);

    const row = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        categoryId,
      },
      create: {
        slug: product.slug,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        categoryId,
      },
    });

    await prisma.productVariant.deleteMany({ where: { productId: row.id } });
    if (product.variants.length > 0) {
      await prisma.productVariant.createMany({
        data: product.variants.map((v) => ({ ...v, productId: row.id })),
      });
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
