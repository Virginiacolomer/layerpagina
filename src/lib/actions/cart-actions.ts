"use server";

import { validateCoupon } from "@/lib/data/coupons";
import { resolveCartLines } from "@/lib/cart";
import type { CartLine, ResolvedCartLine } from "@/lib/catalog-types";

export async function checkCouponAction(code: string, subtotal: number) {
  return validateCoupon(code, subtotal);
}

// El carrito vive en localStorage (sólo ids + cantidades). Los precios y datos
// de producto se resuelven acá, en el servidor, cada vez que cambian las
// líneas, para no mandar el catálogo entero al bundle del cliente.
export async function resolveCartAction(
  lines: CartLine[],
): Promise<{ lines: ResolvedCartLine[]; subtotal: number }> {
  const resolved = await resolveCartLines(lines);
  const subtotal = resolved.reduce((sum, l) => sum + l.lineTotal, 0);
  return { lines: resolved, subtotal };
}
