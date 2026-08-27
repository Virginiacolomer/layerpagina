"use server";

import { validateCoupon } from "@/lib/data/coupons";

export async function checkCouponAction(code: string, subtotal: number) {
  return validateCoupon(code, subtotal);
}
