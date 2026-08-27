"use client";

import { useState } from "react";
import type { Product } from "@/lib/data/products";
import { whatsappLink } from "@/lib/contact";
import { useCart } from "@/lib/cart-context";

export function ProductDetailActions({
  product,
  whatsappNumber,
}: {
  product: Product;
  whatsappNumber?: string;
}) {
  const { addItem } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0]?.id);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId);
  const availableStock = selectedVariant ? selectedVariant.stock : product.stock;
  const outOfStock = availableStock === 0;

  const message = `Hola! Te consulto por "${product.name}"${
    selectedVariant ? ` (${selectedVariant.value})` : ""
  } que vi en la web.`;

  function handleAddToCart() {
    addItem(product.id, selectedVariantId, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="flex flex-col gap-5">
      {product.variants.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-neutral-800">{product.variants[0].name}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                onClick={() => setSelectedVariantId(variant.id)}
                disabled={variant.stock === 0}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
                  selectedVariantId === variant.id
                    ? "border-brand bg-brand text-white"
                    : "border-brand-gray-200 text-neutral-700 hover:border-brand hover:text-brand"
                }`}
              >
                {variant.value}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <label htmlFor="quantity" className="text-sm font-semibold text-neutral-800">
          Cantidad
        </label>
        <input
          id="quantity"
          type="number"
          min={1}
          max={Math.max(availableStock, 1)}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
          className="w-20 rounded-lg border border-brand-gray-300 px-3 py-1.5 outline-none focus:border-brand"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={outOfStock}
          className="rounded-full bg-brand px-6 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {outOfStock ? "Sin stock" : added ? "¡Agregado!" : "Agregar al carrito"}
        </button>

        {whatsappNumber ? (
          <a
            href={whatsappLink(whatsappNumber, message)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-brand-gray-300 px-6 py-3 font-semibold text-neutral-700 transition hover:border-brand hover:text-brand"
          >
            Consultar por WhatsApp
          </a>
        ) : null}
      </div>
    </div>
  );
}
