import Link from "next/link";
import type { Metadata } from "next";
import { ProductCard } from "@/components/product-card";
import { getAllCategories, getAllProducts, getProductsByCategory } from "@/lib/data/products";

export const metadata: Metadata = {
  title: "Catálogo | Layer",
};

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria } = await searchParams;
  const categories = getAllCategories();
  const products = categoria ? getProductsByCategory(categoria) : getAllProducts();
  const activeCategory = categories.find((c) => c.slug === categoria);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-bold text-neutral-900">
        {activeCategory ? activeCategory.name : "Catálogo"}
      </h1>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/productos"
          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
            !categoria
              ? "border-brand bg-brand text-white"
              : "border-brand-gray-200 text-neutral-700 hover:border-brand hover:text-brand"
          }`}
        >
          Todos
        </Link>
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/productos?categoria=${c.slug}`}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              categoria === c.slug
                ? "border-brand bg-brand text-white"
                : "border-brand-gray-200 text-neutral-700 hover:border-brand hover:text-brand"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <p className="mt-10 text-neutral-600">
          Todavía no hay productos cargados en esta categoría.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
