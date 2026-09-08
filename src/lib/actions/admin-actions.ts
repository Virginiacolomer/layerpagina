"use server";

import { revalidatePath } from "next/cache";
import { assertAdmin } from "@/lib/admin";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductActive,
  getProductById,
  type Product,
} from "@/lib/data/products";
import {
  createCoupon,
  toggleCouponActive,
  deleteCoupon,
  type Coupon,
} from "@/lib/data/coupons";
import { updateOrderStatus, type OrderStatus } from "@/lib/data/orders";

type ProductInput = Omit<Product, "id">;
export type ActionResult = { error: string } | { ok: true };

export async function createProductAction(input: ProductInput): Promise<ActionResult> {
  await assertAdmin();
  if (!input.name.trim() || !input.slug.trim()) {
    return { error: "Nombre y slug son obligatorios." };
  }
  try {
    createProduct(input);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo crear el producto." };
  }
  revalidatePath("/admin/productos");
  revalidatePath("/productos");
  revalidatePath("/");
  return { ok: true };
}

export async function updateProductAction(
  id: string,
  input: ProductInput,
): Promise<ActionResult> {
  await assertAdmin();
  if (!input.name.trim() || !input.slug.trim()) {
    return { error: "Nombre y slug son obligatorios." };
  }
  const previous = getProductById(id);
  try {
    const updated = updateProduct(id, input);
    if (!updated) return { error: "Producto no encontrado." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo actualizar el producto." };
  }
  revalidatePath("/admin/productos");
  revalidatePath("/productos");
  if (previous) revalidatePath(`/productos/${previous.slug}`);
  revalidatePath(`/productos/${input.slug}`);
  return { ok: true };
}

export async function deleteProductFormAction(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id"));
  deleteProduct(id);
  revalidatePath("/admin/productos");
  revalidatePath("/productos");
}

export async function toggleProductActiveFormAction(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id"));
  toggleProductActive(id);
  revalidatePath("/admin/productos");
  revalidatePath("/productos");
}

export async function updateOrderStatusFormAction(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as OrderStatus;
  updateOrderStatus(id, status);
  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${id}`);
}

export async function createCouponFormAction(formData: FormData) {
  await assertAdmin();
  const code = String(formData.get("code") ?? "")
    .trim()
    .toUpperCase();
  const type = String(formData.get("type")) === "FIXED" ? "FIXED" : "PERCENTAGE";
  const value = Number(formData.get("value"));
  const minPurchaseRaw = formData.get("minPurchase");
  const minPurchase =
    minPurchaseRaw && String(minPurchaseRaw).trim() ? Number(minPurchaseRaw) : undefined;

  if (!code || Number.isNaN(value) || value <= 0) return;

  const coupon: Coupon = { code, type, value, active: true, minPurchase };
  try {
    createCoupon(coupon);
  } catch {
    // código duplicado: no rompe el flujo, simplemente no crea el cupón
  }
  revalidatePath("/admin/cupones");
}

export async function toggleCouponFormAction(formData: FormData) {
  await assertAdmin();
  const code = String(formData.get("code"));
  toggleCouponActive(code);
  revalidatePath("/admin/cupones");
}

export async function deleteCouponFormAction(formData: FormData) {
  await assertAdmin();
  const code = String(formData.get("code"));
  deleteCoupon(code);
  revalidatePath("/admin/cupones");
}
