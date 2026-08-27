"use client";

import { useState } from "react";
import type { Product } from "@/lib/data/products";
import { whatsappLink } from "@/lib/contact";

// Grouped by variant "name" (e.g. "Color", "Tamaño") so each attribute gets
// its own selector.
function groupVariants(variants: Product["variants"]) {
  const groups = new Map<string, Product["variants"]>();
  for (const v of variants) {
    const group = groups.get(v.name) ?? [];
    group.push(v);
    groups.set(v.name, group);
  }
  return groups;
}

export function ProductDetailActions({
  product,
  whatsappNumber,
}: {
  product: Product;
  whatsappNumber?: string;
}) {
  const variantGroups = groupVariants(product.variants);
  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const [name, options] of variantGroups) {
      initial[name] = options[0].value;
    }
    return initial;
  });

  const selectedLabel = Object.values(selected).join(", ");
  const message = `Hola! Te consulto por "${product.name}"${
    selectedLabel ? ` (${selectedLabel})` : ""
  } que vi en la web.`;

  return (
    <div className="flex flex-col gap-5">
      {[...variantGroups.entries()].map(([name, options]) => (
        <div key={name}>
          <p className="text-sm font-semibold text-neutral-800">{name}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelected((s) => ({ ...s, [name]: opt.value }))}
                disabled={opt.stock === 0}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
                  selected[name] === opt.value
                    ? "border-brand bg-brand text-white"
                    : "border-brand-gray-200 text-neutral-700 hover:border-brand hover:text-brand"
                }`}
              >
                {opt.value}
              </button>
            ))}
          </div>
        </div>
      ))}

      {whatsappNumber ? (
        <a
          href={whatsappLink(whatsappNumber, message)}
          target="_blank"
          rel="noopener noreferrer"
          className="w-fit rounded-full bg-brand px-6 py-3 font-semibold text-white transition hover:opacity-90"
        >
          Consultar por WhatsApp
        </a>
      ) : null}
    </div>
  );
}
