import { getProductById, type Product } from "@/lib/data/products";

export type CartLine = {
  productId: string;
  variantId?: string;
  quantity: number;
};

export type ResolvedCartLine = {
  product: Product;
  variant?: Product["variants"][number];
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export function resolveCartLines(lines: CartLine[]): ResolvedCartLine[] {
  return lines.flatMap((line) => {
    const product = getProductById(line.productId);
    if (!product) return [];
    const variant = line.variantId
      ? product.variants.find((v) => v.id === line.variantId)
      : undefined;
    const unitPrice = product.price + (variant?.priceModifier ?? 0);
    return [
      {
        product,
        variant,
        quantity: line.quantity,
        unitPrice,
        lineTotal: unitPrice * line.quantity,
      },
    ];
  });
}

export function cartSubtotal(lines: CartLine[]) {
  return resolveCartLines(lines).reduce((sum, l) => sum + l.lineTotal, 0);
}
