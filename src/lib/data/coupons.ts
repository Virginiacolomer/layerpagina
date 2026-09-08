import "server-only";
import type { Coupon as CouponRow } from "@prisma/client";
import { prisma, isForeignKeyError, isNotFoundError } from "@/lib/db";

export type Coupon = {
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  active: boolean;
  minPurchase?: number;
};

export type CouponResult =
  | { valid: true; coupon: Coupon; discount: number }
  | { valid: false; message: string };

function toCoupon(row: CouponRow): Coupon {
  return {
    code: row.code,
    type: row.type,
    value: Number(row.value),
    active: row.active,
    minPurchase: row.minPurchase != null ? Number(row.minPurchase) : undefined,
  };
}

export async function validateCoupon(code: string, subtotal: number): Promise<CouponResult> {
  const row = await prisma.coupon.findUnique({ where: { code: code.trim().toUpperCase() } });
  if (!row || !row.active) {
    return { valid: false, message: "El cupón no existe o ya no está activo." };
  }
  const coupon = toCoupon(row);
  if (coupon.minPurchase && subtotal < coupon.minPurchase) {
    return {
      valid: false,
      message: `Este cupón requiere una compra mínima de $${coupon.minPurchase.toLocaleString("es-AR")}.`,
    };
  }
  const discount =
    coupon.type === "PERCENTAGE"
      ? Math.round((subtotal * coupon.value) / 100)
      : coupon.value;
  return { valid: true, coupon, discount: Math.min(discount, subtotal) };
}

// --- Admin ---

export async function getAllCoupons(): Promise<Coupon[]> {
  const rows = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map(toCoupon);
}

export async function createCoupon(input: Coupon): Promise<Coupon> {
  if (await prisma.coupon.findUnique({ where: { code: input.code } })) {
    throw new Error("Ya existe un cupón con ese código.");
  }
  const row = await prisma.coupon.create({
    data: {
      code: input.code,
      type: input.type,
      value: input.value,
      active: input.active,
      minPurchase: input.minPurchase ?? null,
    },
  });
  return toCoupon(row);
}

export async function toggleCouponActive(code: string): Promise<Coupon | undefined> {
  const current = await prisma.coupon.findUnique({ where: { code } });
  if (!current) return undefined;
  const row = await prisma.coupon.update({
    where: { code },
    data: { active: !current.active },
  });
  return toCoupon(row);
}

export async function deleteCoupon(code: string): Promise<boolean> {
  try {
    await prisma.coupon.delete({ where: { code } });
    return true;
  } catch (error) {
    if (isNotFoundError(error)) return false;
    if (isForeignKeyError(error)) {
      // Cupón ya usado en pedidos: lo desactivamos en vez de borrarlo para no
      // romper el historial.
      await prisma.coupon.update({ where: { code }, data: { active: false } });
      return true;
    }
    throw error;
  }
}
