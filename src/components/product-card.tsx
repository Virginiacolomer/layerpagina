import Link from "next/link";
import { ProductImage } from "@/components/product-image";
import type { Product } from "@/lib/catalog-types";
import { formatPrice } from "@/lib/format";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/productos/${product.slug}`}
      className="group flex flex-col gap-3 rounded-xl border border-brand-gray-200 p-3 transition hover:border-brand hover:shadow-sm"
    >
      <ProductImage src={product.images[0]} alt={product.name} seed={product.id} />
      <div>
        <h3 className="font-semibold leading-snug text-neutral-900 group-hover:text-brand">
          {product.name}
        </h3>
        <p className="mt-1 font-medium text-brand">{formatPrice(product.price)}</p>
        {product.stock === 0 && (
          <p className="mt-1 text-sm text-neutral-500">Sin stock</p>
        )}
      </div>
    </Link>
  );
}
