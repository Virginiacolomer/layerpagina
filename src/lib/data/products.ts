import "server-only";
import { Prisma } from "@prisma/client";
import { prisma, isForeignKeyError, isNotFoundError } from "@/lib/db";
import { CATEGORIES } from "@/lib/categories";
import type { Product, ProductVariant } from "@/lib/catalog-types";

export type { Product, ProductVariant } from "@/lib/catalog-types";

const productInclude = {
  variants: { orderBy: { id: "asc" } },
  images: { orderBy: { order: "asc" } },
  category: true,
} satisfies Prisma.ProductInclude;

type ProductRow = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    stock: row.stock,
    active: row.active,
    colorCount: row.colorCount,
    categorySlug: row.category.slug,
    variants: row.variants.map((v) => ({
      id: v.id,
      name: v.name,
      value: v.value,
      priceModifier: Number(v.priceModifier),
      stock: v.stock,
    })),
    images: row.images.map((img) => img.url),
  };
}

// Categorías: la lista fija de src/lib/categories.ts sigue siendo la fuente de
// verdad (el seed crea exactamente estas). Si más adelante el admin necesita
// crear categorías, esto pasa a leer de la tabla Category.
export function getAllCategories() {
  return CATEGORIES;
}

export async function getAllProducts(): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { active: true },
    include: productInclude,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toProduct);
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { active: true, category: { slug: categorySlug } },
    include: productInclude,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const row = await prisma.product.findFirst({
    where: { slug, active: true },
    include: productInclude,
  });
  return row ? toProduct(row) : undefined;
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const row = await prisma.product.findUnique({ where: { id }, include: productInclude });
  return row ? toProduct(row) : undefined;
}

// Para resolver líneas del carrito: trae varios por id de una, sin filtrar por
// `active` (si un producto se ocultó con algo ya en el carrito, igual se puede
// terminar la compra).
export async function getProductsByIds(ids: string[]): Promise<Map<string, Product>> {
  if (ids.length === 0) return new Map();
  const rows = await prisma.product.findMany({
    where: { id: { in: ids } },
    include: productInclude,
  });
  return new Map(rows.map((row) => [row.id, toProduct(row)]));
}

// --- Admin: incluye productos inactivos y permite escribir. ---

export async function getAllProductsForAdmin(): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    include: productInclude,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toProduct);
}

// Las imágenes se manejan aparte (subida a Storage en la server action, ver
// syncProductImages), así que el input de datos no las incluye.
export type ProductInput = Omit<Product, "id" | "images">;

async function categoryIdForSlug(slug: string): Promise<string> {
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) throw new Error("La categoría seleccionada no existe.");
  return category.id;
}

function variantCreateData(variants: ProductVariant[]) {
  return variants.map((v) => ({
    name: v.name,
    value: v.value,
    priceModifier: v.priceModifier,
    stock: v.stock,
  }));
}

export async function createProduct(input: ProductInput): Promise<Product> {
  if (await prisma.product.findUnique({ where: { slug: input.slug } })) {
    throw new Error("Ya existe un producto con ese slug.");
  }
  const categoryId = await categoryIdForSlug(input.categorySlug);
  const row = await prisma.product.create({
    data: {
      slug: input.slug,
      name: input.name,
      description: input.description,
      price: input.price,
      stock: input.stock,
      active: input.active,
      colorCount: input.colorCount,
      categoryId,
      variants: { create: variantCreateData(input.variants) },
    },
    include: productInclude,
  });
  return toProduct(row);
}

export async function updateProduct(
  id: string,
  input: ProductInput,
): Promise<Product | undefined> {
  if (!(await prisma.product.findUnique({ where: { id } }))) return undefined;
  const slugOwner = await prisma.product.findUnique({ where: { slug: input.slug } });
  if (slugOwner && slugOwner.id !== id) {
    throw new Error("Ya existe otro producto con ese slug.");
  }
  const categoryId = await categoryIdForSlug(input.categorySlug);

  try {
    const row = await prisma.$transaction(async (tx) => {
      await tx.productVariant.deleteMany({ where: { productId: id } });
      return tx.product.update({
        where: { id },
        data: {
          slug: input.slug,
          name: input.name,
          description: input.description,
          price: input.price,
          stock: input.stock,
          active: input.active,
          colorCount: input.colorCount,
          categoryId,
          variants: { create: variantCreateData(input.variants) },
        },
        include: productInclude,
      });
    });
    return toProduct(row);
  } catch (error) {
    if (isForeignKeyError(error)) {
      throw new Error(
        "Este producto tiene variantes ya usadas en pedidos, no se pueden reestructurar. " +
          "Editá el resto de los datos sin tocar las variantes, o creá un producto nuevo.",
      );
    }
    throw error;
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    await prisma.product.delete({ where: { id } });
    return true;
  } catch (error) {
    if (isNotFoundError(error)) return false;
    if (isForeignKeyError(error)) {
      // Tiene pedidos asociados: borrarlo rompería el historial, así que lo
      // ocultamos del catálogo en lugar de eliminarlo.
      await prisma.product.update({ where: { id }, data: { active: false } });
      return true;
    }
    throw error;
  }
}

export async function toggleProductActive(id: string): Promise<Product | undefined> {
  const current = await prisma.product.findUnique({ where: { id } });
  if (!current) return undefined;
  const row = await prisma.product.update({
    where: { id },
    data: { active: !current.active },
    include: productInclude,
  });
  return toProduct(row);
}

// Reemplaza todas las filas ProductImage del producto por `urls`, en ese orden.
// Las subidas/borrados en Storage los hace la server action; acá sólo se
// persiste la lista final.
export async function syncProductImages(productId: string, urls: string[]): Promise<void> {
  await prisma.$transaction([
    prisma.productImage.deleteMany({ where: { productId } }),
    prisma.productImage.createMany({
      data: urls.map((url, index) => ({ productId, url, order: index })),
    }),
  ]);
}
