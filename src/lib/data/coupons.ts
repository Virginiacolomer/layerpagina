export type Coupon = {
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  active: boolean;
  minPurchase?: number;
};

// Cupones de ejemplo — temporal hasta conectar la base de datos real (ver
// plan del proyecto). En la fase de panel de administración, esto se
// reemplaza por la tabla Coupon de Prisma con altas/bajas desde el admin.
const COUPONS: Coupon[] = [
  { code: "BIENVENIDO10", type: "PERCENTAGE", value: 10, active: true },
  { code: "LAYER5000", type: "FIXED", value: 5000, active: true, minPurchase: 20000 },
];

export type CouponResult =
  | { valid: true; coupon: Coupon; discount: number }
  | { valid: false; message: string };

export function validateCoupon(code: string, subtotal: number): CouponResult {
  const coupon = COUPONS.find((c) => c.code === code.trim().toUpperCase());
  if (!coupon || !coupon.active) {
    return { valid: false, message: "El cupón no existe o ya no está activo." };
  }
  if (coupon.minPurchase && subtotal < coupon.minPurchase) {
    return {
      valid: false,
      message: `Este cupón requiere una compra mínima de $${coupon.minPurchase.toLocaleString("es-AR")}.`,
    };
  }
  const discount =
    coupon.type === "PERCENTAGE" ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
  return { valid: true, coupon, discount: Math.min(discount, subtotal) };
}

// --- Admin ---

export function getAllCoupons() {
  return COUPONS;
}

export function createCoupon(input: Coupon): Coupon {
  if (COUPONS.some((c) => c.code === input.code)) {
    throw new Error("Ya existe un cupón con ese código.");
  }
  COUPONS.push(input);
  return input;
}

export function toggleCouponActive(code: string) {
  const coupon = COUPONS.find((c) => c.code === code);
  if (coupon) coupon.active = !coupon.active;
  return coupon;
}

export function deleteCoupon(code: string): boolean {
  const index = COUPONS.findIndex((c) => c.code === code);
  if (index === -1) return false;
  COUPONS.splice(index, 1);
  return true;
}
