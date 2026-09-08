import "server-only";
import { getProductsByIds } from "@/lib/data/products";
import type { CartLine, ResolvedCartLine } from "@/lib/catalog-types";

export type { CartLine, ResolvedCartLine } from "@/lib/catalog-types";

export async function resolveCartLines(lines: CartLine[]): Promise<ResolvedCartLine[]> {
  if (lines.length === 0) return [];
  const products = await getProductsByIds([...new Set(lines.map((l) => l.productId))]);

  return lines.flatMap((line) => {
    const product = products.get(line.productId);
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

export async function cartSubtotal(lines: CartLine[]): Promise<number> {
  const resolved = await resolveCartLines(lines);
  return resolved.reduce((sum, l) => sum + l.lineTotal, 0);
}
