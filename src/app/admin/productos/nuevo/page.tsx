import type { Metadata } from "next";
import { ProductAdminForm } from "@/components/product-admin-form";

export const metadata: Metadata = { title: "Nuevo producto | Admin Layer" };

export default function NuevoProductoPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">Nuevo producto</h1>
      <div className="mt-6">
        <ProductAdminForm />
      </div>
    </div>
  );
}
