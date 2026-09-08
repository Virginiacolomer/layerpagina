import { CATEGORIES } from "@/lib/categories";

export type ProductVariant = {
  id: string;
  name: string;
  value: string;
  priceModifier: number;
  stock: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  active: boolean;
  categorySlug: string;
  variants: ProductVariant[];
};

// Catálogo de ejemplo hasta que haya una base de datos conectada (ver fase de
// datos del proyecto). La forma de estos datos y de las funciones de abajo
// imita lo que devolvería Prisma, para que las páginas no cambien al conectar
// la base real.
const PRODUCTS: Product[] = [
  {
    id: "p1",
    slug: "busto-iron-man",
    name: "Busto Iron Man",
    description:
      "Busto articulado de Iron Man impreso en resina y pintado a mano, con detalles de luces LED en el arc reactor. Pieza de colección.",
    price: 42000,
    stock: 3,
    active: true,
    categorySlug: "personajes",
    variants: [],
  },
  {
    id: "p2",
    slug: "diorama-rick-y-morty",
    name: "Diorama Rick y Morty",
    description:
      "Diorama de Rick y Morty sobre base rocosa con tentáculos, pintado a mano con acabado mate. Incluye base con nombre personalizable.",
    price: 38000,
    stock: 2,
    active: true,
    categorySlug: "dioramas",
    variants: [
      { id: "p2-v1", name: "Base", value: "Con nombre grabado", priceModifier: 2000, stock: 2 },
      { id: "p2-v2", name: "Base", value: "Sin grabado", priceModifier: 0, stock: 4 },
    ],
  },
  {
    id: "p3",
    slug: "funko-personalizado",
    name: "Funko Pop personalizado",
    description:
      "Tu Funko Pop a medida, hecho a partir de una foto tuya o de la persona que quieras regalar. Elegí el color de piel y outfit.",
    price: 15000,
    stock: 10,
    active: true,
    categorySlug: "funko-pop-personalizados",
    variants: [
      { id: "p3-v1", name: "Tamaño", value: "Estándar (10cm)", priceModifier: 0, stock: 10 },
      { id: "p3-v2", name: "Tamaño", value: "Grande (15cm)", priceModifier: 6000, stock: 5 },
    ],
  },
  {
    id: "p4",
    slug: "llavero-logo-personalizado",
    name: "Llavero con logo personalizado",
    description:
      "Llavero impreso en PLA resistente con el logo, iniciales o texto que quieras. Ideal para regalos de eventos o merchandising.",
    price: 3500,
    stock: 50,
    active: true,
    categorySlug: "llaveros",
    variants: [
      { id: "p4-v1", name: "Color", value: "Naranja", priceModifier: 0, stock: 20 },
      { id: "p4-v2", name: "Color", value: "Negro", priceModifier: 0, stock: 20 },
      { id: "p4-v3", name: "Color", value: "Blanco", priceModifier: 0, stock: 10 },
    ],
  },
  {
    id: "p5",
    slug: "maceta-geometrica",
    name: "Maceta geométrica",
    description:
      "Maceta decorativa de diseño geométrico para plantas chicas, con plato incluido. Ideal para escritorio o repisa.",
    price: 9500,
    stock: 15,
    active: true,
    categorySlug: "hogar-y-decoracion",
    variants: [
      { id: "p5-v1", name: "Color", value: "Blanco", priceModifier: 0, stock: 8 },
      { id: "p5-v2", name: "Color", value: "Gris", priceModifier: 0, stock: 7 },
    ],
  },
  {
    id: "p6",
    slug: "organizador-escritorio-modular",
    name: "Organizador de escritorio modular",
    description:
      "Set modular para organizar lápices, clips y accesorios de escritorio. Módulos apilables para armar tu propia configuración.",
    price: 12000,
    stock: 8,
    active: true,
    categorySlug: "organizadores-de-escritorio",
    variants: [],
  },
  {
    id: "p7",
    slug: "souvenirs-cumple-x10",
    name: "Souvenirs para eventos (pack x10)",
    description:
      "Pack de 10 souvenirs personalizados con el motivo, color y texto que elijas. Perfecto para cumpleaños o eventos temáticos.",
    price: 18000,
    stock: 6,
    active: true,
    categorySlug: "productos-para-eventos",
    variants: [],
  },
  {
    id: "p8",
    slug: "juguete-dispensador-mascotas",
    name: "Juguete dispensador para mascotas",
    description:
      "Juguete interactivo que dispensa premios mientras tu mascota juega. Resistente a mordidas, en PLA+ apto para uso con mascotas.",
    price: 11000,
    stock: 12,
    active: true,
    categorySlug: "juguetes-para-mascotas",
    variants: [],
  },
  {
    id: "p9",
    slug: "comedero-doble-antideslizante",
    name: "Comedero doble antideslizante",
    description:
      "Comedero doble para agua y comida, con base antideslizante. Fácil de limpiar y disponible en distintos tamaños según tu mascota.",
    price: 13500,
    stock: 9,
    active: true,
    categorySlug: "comederos-para-mascotas",
    variants: [
      { id: "p9-v1", name: "Tamaño", value: "Chico", priceModifier: 0, stock: 5 },
      { id: "p9-v2", name: "Tamaño", value: "Grande", priceModifier: 2500, stock: 4 },
    ],
  },
];

export function getAllCategories() {
  return CATEGORIES;
}

export function getAllProducts() {
  return PRODUCTS.filter((p) => p.active);
}

export function getProductsByCategory(categorySlug: string) {
  return PRODUCTS.filter((p) => p.active && p.categorySlug === categorySlug);
}

export function getProductBySlug(slug: string) {
  return PRODUCTS.find((p) => p.active && p.slug === slug);
}

export function getProductById(id: string) {
  return PRODUCTS.find((p) => p.id === id);
}

// --- Admin: incluye productos inactivos y permite escribir. ---

export function getAllProductsForAdmin() {
  return PRODUCTS;
}

let nextProductId = PRODUCTS.length + 1;

export function createProduct(input: Omit<Product, "id">): Product {
  if (PRODUCTS.some((p) => p.slug === input.slug)) {
    throw new Error("Ya existe un producto con ese slug.");
  }
  const product: Product = { id: `p${nextProductId++}`, ...input };
  PRODUCTS.push(product);
  return product;
}

export function updateProduct(id: string, input: Omit<Product, "id">): Product | undefined {
  const index = PRODUCTS.findIndex((p) => p.id === id);
  if (index === -1) return undefined;
  if (PRODUCTS.some((p) => p.id !== id && p.slug === input.slug)) {
    throw new Error("Ya existe otro producto con ese slug.");
  }
  PRODUCTS[index] = { id, ...input };
  return PRODUCTS[index];
}

export function deleteProduct(id: string): boolean {
  const index = PRODUCTS.findIndex((p) => p.id === id);
  if (index === -1) return false;
  PRODUCTS.splice(index, 1);
  return true;
}

export function toggleProductActive(id: string) {
  const product = PRODUCTS.find((p) => p.id === id);
  if (product) product.active = !product.active;
  return product;
}
