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
  // true si la categoría es "sólo consulta": no se compra online.
  consultOnly: boolean;
  variants: ProductVariant[];
  // URLs públicas de las fotos, en orden. Vacío = se muestra el placeholder.
  images: string[];
  // Cuántos colores de la paleta debe elegir el cliente. 0 = no pide color.
  colorCount: number;
};

export type CartLine = {
  productId: string;
  variantId?: string;
  quantity: number;
  colors?: string[];
};

export type ResolvedCartLine = {
  product: Product;
  variant?: ProductVariant;
  colors: string[];
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};
