"use client";

import { useState } from "react";
import Image from "next/image";
import { ProductImagePlaceholder } from "@/components/product-image-placeholder";

export function ProductGallery({
  images,
  name,
  seed,
}: {
  images: string[];
  name: string;
  seed: string;
}) {
  const [active, setActive] = useState(0);

  if (images.length === 0) return <ProductImagePlaceholder seed={seed} />;

  const current = images[Math.min(active, images.length - 1)];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-brand-gray-100">
        <Image
          src={current}
          alt={name}
          fill
          sizes="(min-width: 640px) 50vw, 100vw"
          priority
          className="object-cover"
        />
      </div>

      {images.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {images.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setActive(i)}
              className={`relative h-16 w-16 overflow-hidden rounded-md border transition ${
                i === active ? "border-brand" : "border-brand-gray-200 hover:border-brand"
              }`}
              aria-label={`Ver foto ${i + 1}`}
            >
              <Image src={url} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
