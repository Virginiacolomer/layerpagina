"use server";

import { auth } from "@/auth";
import { resolveCartLines } from "@/lib/cart";
import type { CartLine } from "@/lib/catalog-types";
import { createOrder } from "@/lib/data/orders";
import { validateCoupon } from "@/lib/data/coupons";
import { sendNewOrderEmail } from "@/lib/email";

export type ShippingInfo = {
  name: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
};

export type PlaceOrderResult = { error: string } | { orderId: string };

export async function placeOrderAction(
  lines: CartLine[],
  couponCode: string | null,
  shipping: ShippingInfo,
): Promise<PlaceOrderResult> {
  const session = await auth();
  if (!session?.user) return { error: "Tenés que iniciar sesión para continuar." };

  const resolved = await resolveCartLines(lines);
  if (resolved.length === 0) return { error: "Tu carrito está vacío." };

  if (
    !shipping.name.trim() ||
    !shipping.phone.trim() ||
    !shipping.street.trim() ||
    !shipping.city.trim() ||
    !shipping.province.trim() ||
    !shipping.postalCode.trim()
  ) {
    return { error: "Completá todos los datos de envío." };
  }

  const subtotal = resolved.reduce((sum, l) => sum + l.lineTotal, 0);
  let discount = 0;
  if (couponCode) {
    const result = await validateCoupon(couponCode, subtotal);
    if (result.valid) discount = result.discount;
  }

  const order = await createOrder({
    userId: session.user.id,
    items: resolved.map((l) => ({
      productId: l.product.id,
      variantId: l.variant?.id,
      productName: l.product.name,
      variantLabel: l.variant?.value,
      colors: l.colors,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
    })),
    subtotal,
    discount,
    total: subtotal - discount,
    couponCode: couponCode ?? undefined,
    shippingName: shipping.name,
    shippingPhone: shipping.phone,
    shippingStreet: shipping.street,
    shippingCity: shipping.city,
    shippingProvince: shipping.province,
    shippingPostalCode: shipping.postalCode,
  });

  await sendNewOrderEmail(order);

  return { orderId: order.id };
}
