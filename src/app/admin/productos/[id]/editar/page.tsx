import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductById } from "@/lib/data/products";
import { ProductAdminForm } from "@/components/product-admin-form";

export const metadata: Metadata = { title: "Editar producto | Admin Layer" };

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">Editar producto</h1>
      <div className="mt-6">
        <ProductAdminForm product={product} />
      </div>
    </div>
  );
}
