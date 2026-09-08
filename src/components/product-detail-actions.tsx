"use client";

import { useState } from "react";
import type { Product } from "@/lib/catalog-types";
import { COLOR_PALETTE } from "@/lib/colors";
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
  const [colors, setColors] = useState<string[]>([]);
  const [added, setAdded] = useState(false);

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId);
  const availableStock = selectedVariant ? selectedVariant.stock : product.stock;
  const outOfStock = availableStock === 0;

  const needsColors = product.colorCount > 0;
  const colorsComplete = !needsColors || colors.length === product.colorCount;

  function toggleColor(name: string) {
    setColors((prev) => {
      if (prev.includes(name)) return prev.filter((c) => c !== name);
      if (prev.length >= product.colorCount) return prev; // ya llegó al máximo
      return [...prev, name];
    });
  }

  const message = `Hola! Te consulto por "${product.name}"${
    selectedVariant ? ` (${selectedVariant.value})` : ""
  }${colors.length > 0 ? ` en ${colors.join(", ")}` : ""} que vi en la web.`;

  function handleAddToCart() {
    if (outOfStock || !colorsComplete) return;
    addItem(product.id, selectedVariantId, quantity, needsColors ? colors : undefined);
    setAdded(true);
    setColors([]);
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

      {needsColors && (
        <div>
          <p className="text-sm font-semibold text-neutral-800">
            Elegí {product.colorCount} {product.colorCount === 1 ? "color" : "colores"}{" "}
            <span className="font-normal text-neutral-500">
              ({colors.length}/{product.colorCount})
            </span>
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {COLOR_PALETTE.map((color) => {
              const selected = colors.includes(color.name);
              const atMax = colors.length >= product.colorCount;
              return (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => toggleColor(color.name)}
                  disabled={!selected && atMax}
                  title={color.name}
                  aria-pressed={selected}
                  className={`relative h-9 w-9 rounded-full border-2 transition disabled:cursor-not-allowed disabled:opacity-30 ${
                    selected ? "border-brand" : "border-black/10 hover:border-brand/50"
                  }`}
                  style={{ backgroundColor: color.hex }}
                >
                  {selected && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">
                      {colors.indexOf(color.name) + 1}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {colors.length > 0 && (
            <p className="mt-2 text-sm text-neutral-600">Elegidos: {colors.join(", ")}</p>
          )}
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
          disabled={outOfStock || !colorsComplete}
          className="rounded-full bg-brand px-6 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {outOfStock
            ? "Sin stock"
            : added
              ? "¡Agregado!"
              : !colorsComplete
                ? `Elegí ${product.colorCount - colors.length} color(es) más`
                : "Agregar al carrito"}
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
