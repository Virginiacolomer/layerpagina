"use server";

import { revalidatePath } from "next/cache";
import { assertAdmin } from "@/lib/admin";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductActive,
  getProductById,
  syncProductImages,
  type ProductInput,
} from "@/lib/data/products";
import {
  createCoupon,
  toggleCouponActive,
  deleteCoupon,
  type Coupon,
} from "@/lib/data/coupons";
import { updateOrderStatus, type OrderStatus } from "@/lib/data/orders";
import { uploadProductImage, deleteProductImageByUrl } from "@/lib/storage";

export type ActionResult = { error: string } | { ok: true };

async function uploadAll(productId: string, files: File[]): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    if (file && file.size > 0) urls.push(await uploadProductImage(productId, file));
  }
  return urls;
}

export async function createProductAction(
  input: ProductInput,
  newImages: File[] = [],
): Promise<ActionResult> {
  await assertAdmin();
  if (!input.name.trim() || !input.slug.trim()) {
    return { error: "Nombre y slug son obligatorios." };
  }
  try {
    const product = await createProduct(input);
    if (newImages.length > 0) {
      const urls = await uploadAll(product.id, newImages);
      await syncProductImages(product.id, urls);
    }
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
  keptImageUrls: string[] = [],
  newImages: File[] = [],
): Promise<ActionResult> {
  await assertAdmin();
  if (!input.name.trim() || !input.slug.trim()) {
    return { error: "Nombre y slug son obligatorios." };
  }
  const previous = await getProductById(id);
  if (!previous) return { error: "Producto no encontrado." };

  try {
    const updated = await updateProduct(id, input);
    if (!updated) return { error: "Producto no encontrado." };

    const uploadedUrls = await uploadAll(id, newImages);
    await syncProductImages(id, [...keptImageUrls, ...uploadedUrls]);

    // Borrar de Storage las fotos que el admin quitó.
    const removed = previous.images.filter((url) => !keptImageUrls.includes(url));
    await Promise.all(removed.map((url) => deleteProductImageByUrl(url)));
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo actualizar el producto." };
  }
  revalidatePath("/admin/productos");
  revalidatePath("/productos");
  revalidatePath(`/productos/${previous.slug}`);
  revalidatePath(`/productos/${input.slug}`);
  return { ok: true };
}

export async function deleteProductFormAction(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id"));
  const product = await getProductById(id);
  await deleteProduct(id);
  if (product) {
    await Promise.all(product.images.map((url) => deleteProductImageByUrl(url)));
  }
  revalidatePath("/admin/productos");
  revalidatePath("/productos");
}

export async function toggleProductActiveFormAction(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id"));
  await toggleProductActive(id);
  revalidatePath("/admin/productos");
  revalidatePath("/productos");
}

export async function updateOrderStatusFormAction(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as OrderStatus;
  await updateOrderStatus(id, status);
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
    await createCoupon(coupon);
  } catch {
    // código duplicado: no rompe el flujo, simplemente no crea el cupón
  }
  revalidatePath("/admin/cupones");
}

export async function toggleCouponFormAction(formData: FormData) {
  await assertAdmin();
  const code = String(formData.get("code"));
  await toggleCouponActive(code);
  revalidatePath("/admin/cupones");
}

export async function deleteCouponFormAction(formData: FormData) {
  await assertAdmin();
  const code = String(formData.get("code"));
  await deleteCoupon(code);
  revalidatePath("/admin/cupones");
}
