import Image from "next/image";
import { ProductImagePlaceholder } from "@/components/product-image-placeholder";

// Muestra la primera foto del producto, o el placeholder de marca si todavía
// no tiene ninguna.
export function ProductImage({
  src,
  alt,
  seed,
  sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw",
  priority = false,
}: {
  src?: string;
  alt: string;
  seed: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (!src) return <ProductImagePlaceholder seed={seed} />;

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-brand-gray-100">
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    </div>
  );
}
