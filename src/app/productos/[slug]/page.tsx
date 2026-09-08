import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ProductGallery } from "@/components/product-gallery";
import { ProductDetailActions } from "@/components/product-detail-actions";
import { getAllCategories, getProductBySlug } from "@/lib/data/products";
import { WHATSAPP_NUMBERS } from "@/lib/contact";
import { formatPrice } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return { title: product ? `${product.name} | Layer` : "Producto | Layer" };
}

export default async function ProductoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const category = getAllCategories().find((c) => c.slug === product.categorySlug);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      {category && (
        <Link
          href={`/productos?categoria=${category.slug}`}
          className="text-sm font-medium text-neutral-600 hover:text-brand"
        >
          ← {category.name}
        </Link>
      )}

      <div className="mt-4 grid gap-10 sm:grid-cols-2">
        <div className="sm:max-w-md">
          <ProductGallery images={product.images} name={product.name} seed={product.id} />
        </div>

        <div>
          <h1 className="text-3xl font-bold text-neutral-900">{product.name}</h1>
          <p className="mt-2 text-2xl font-semibold text-brand">{formatPrice(product.price)}</p>
          <p className="mt-1 text-sm text-neutral-500">
            {product.stock > 0 ? `${product.stock} disponibles` : "Sin stock por el momento"}
          </p>
          <p className="mt-4 text-neutral-700">{product.description}</p>

          <div className="mt-6">
            <ProductDetailActions product={product} whatsappNumber={WHATSAPP_NUMBERS[0]} />
          </div>
        </div>
      </div>
    </div>
  );
}
