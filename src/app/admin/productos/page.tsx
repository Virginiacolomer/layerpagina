import type { Metadata } from "next";
import Link from "next/link";
import { getAllProductsForAdmin, getAllCategories } from "@/lib/data/products";
import { toggleProductActiveFormAction, deleteProductFormAction } from "@/lib/actions/admin-actions";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Productos | Admin Layer" };

export default function AdminProductosPage() {
  const products = getAllProductsForAdmin();
  const categories = getAllCategories();
  const categoryName = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? slug;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Productos</h1>
        <Link
          href="/admin/productos/nuevo"
          className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Nuevo producto
        </Link>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-brand-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-brand-gray-100 text-left text-neutral-600">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3">Precio</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t border-brand-gray-200">
                <td className="px-4 py-3 font-medium text-neutral-900">{product.name}</td>
                <td className="px-4 py-3 text-neutral-600">
                  {categoryName(product.categorySlug)}
                </td>
                <td className="px-4 py-3">{formatPrice(product.price)}</td>
                <td className="px-4 py-3">{product.stock}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      product.active
                        ? "bg-green-100 text-green-800"
                        : "bg-neutral-200 text-neutral-600"
                    }`}
                  >
                    {product.active ? "Activo" : "Oculto"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3 text-sm">
                    <Link
                      href={`/admin/productos/${product.id}/editar`}
                      className="font-medium text-brand hover:underline"
                    >
                      Editar
                    </Link>
                    <form action={toggleProductActiveFormAction}>
                      <input type="hidden" name="id" value={product.id} />
                      <button type="submit" className="text-neutral-500 hover:text-brand">
                        {product.active ? "Ocultar" : "Publicar"}
                      </button>
                    </form>
                    <form action={deleteProductFormAction}>
                      <input type="hidden" name="id" value={product.id} />
                      <button type="submit" className="text-neutral-400 hover:text-red-600">
                        Eliminar
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
