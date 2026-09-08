// Tipos que cruzan la frontera cliente/servidor (carrito, cards de producto,
// formulario de admin). No tienen runtime, así que se pueden importar desde
// cualquier lado sin arrastrar Prisma al bundle del cliente.

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

export type CartLine = {
  productId: string;
  variantId?: string;
  quantity: number;
};

export type ResolvedCartLine = {
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};
