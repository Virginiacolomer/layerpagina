import Link from "next/link";
import { getAllCategories } from "@/lib/data/products";

export default function Home() {
  const categories = getAllCategories();

  return (
    <div className="flex flex-1 flex-col">
      <section className="flex flex-col items-center gap-4 bg-brand-gray-100 px-6 py-20 text-center">
        <h1 className="text-5xl font-extrabold text-brand">Layer</h1>
        <p className="max-w-md text-lg text-neutral-700">
          Diseñamos en capas, pensamos en grande.
        </p>
        <Link
          href="/productos"
          className="mt-2 rounded-full bg-brand px-6 py-3 font-semibold text-white transition hover:opacity-90"
        >
          Ver catálogo
        </Link>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-14">
        <h2 className="text-2xl font-bold text-neutral-900">Categorías</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/productos?categoria=${category.slug}`}
              className="flex items-center justify-center rounded-xl border border-brand-gray-200 px-4 py-8 text-center font-medium text-neutral-800 transition hover:border-brand hover:text-brand"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
