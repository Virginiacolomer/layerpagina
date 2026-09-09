import Link from "next/link";
import { getAllCategories } from "@/lib/data/products";
import { LayerMark } from "@/components/layer-logo";
import { WavyBackground } from "@/components/wavy-background";
import { ScrollFadeImage } from "@/components/scroll-fade-image";

export default function Home() {
  const categories = getAllCategories();

  return (
    <div className="flex flex-1 flex-col">
      <section className="relative flex flex-col items-center gap-4 overflow-hidden bg-brand-gray-100 px-6 py-24 text-center">
        <WavyBackground />
        <div className="relative flex flex-col items-center gap-4">
          <LayerMark className="h-20 w-20" />
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
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 px-6 py-16 text-center">
        <LayerMark className="h-12 w-12" />
        <h2 className="text-2xl font-bold text-neutral-900">Quiénes somos</h2>
        <p className="mx-auto max-w-2xl text-neutral-700">
          Somos Layer, un emprendimiento de impresión 3D con base en Villa María, Córdoba.
          Diseñamos y fabricamos piezas a medida —piezas de decoracion, articulos corporativos,
          personalizados y repuestos— cuidando cada detalle, del diseño a la impresión. Hacemos
          envíos a todo el país.
        </p>
        <ScrollFadeImage src="/nosotros.jpg" alt="El equipo de Layer en una feria con sus impresiones 3D" />
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
