"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/data/products";
import { CATEGORIES, slugify } from "@/lib/categories";
import { createProductAction, updateProductAction } from "@/lib/actions/admin-actions";

type VariantDraft = {
  key: string;
  name: string;
  value: string;
  priceModifier: string;
  stock: string;
};

function newVariant(): VariantDraft {
  return {
    key: crypto.randomUUID(),
    name: "",
    value: "",
    priceModifier: "0",
    stock: "0",
  };
}

export function ProductAdminForm({ product }: { product?: Product }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(String(product?.price ?? ""));
  const [stock, setStock] = useState(String(product?.stock ?? ""));
  const [active, setActive] = useState(product?.active ?? true);
  const [categorySlug, setCategorySlug] = useState(product?.categorySlug ?? CATEGORIES[0].slug);
  const [variants, setVariants] = useState<VariantDraft[]>(
    (product?.variants ?? []).map((v) => ({
      key: v.id,
      name: v.name,
      value: v.value,
      priceModifier: String(v.priceModifier),
      stock: String(v.stock),
    })),
  );

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function updateVariant(key: string, patch: Partial<VariantDraft>) {
    setVariants((vs) => vs.map((v) => (v.key === key ? { ...v, ...patch } : v)));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsedPrice = Number(price);
    const parsedStock = Number(stock);
    if (!name.trim() || !slug.trim()) {
      setError("Completá el nombre y el slug.");
      return;
    }
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      setError("El precio tiene que ser un número válido.");
      return;
    }
    if (Number.isNaN(parsedStock) || parsedStock < 0) {
      setError("El stock tiene que ser un número válido.");
      return;
    }
    for (const v of variants) {
      if (!v.name.trim() || !v.value.trim()) {
        setError("Completá el nombre y el valor de cada variante (o quitá las vacías).");
        return;
      }
    }

    const input = {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim(),
      price: parsedPrice,
      stock: parsedStock,
      active,
      categorySlug,
      variants: variants.map((v) => ({
        id: v.key,
        name: v.name.trim(),
        value: v.value.trim(),
        priceModifier: Number(v.priceModifier) || 0,
        stock: Number(v.stock) || 0,
      })),
    };

    startTransition(async () => {
      const result = product
        ? await updateProductAction(product.id, input)
        : await createProductAction(input);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      router.push("/admin/productos");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-4">
      <div>
        <label htmlFor="name" className="text-sm font-medium text-neutral-800">
          Nombre
        </label>
        <input
          id="name"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          className="mt-1 w-full rounded-lg border border-brand-gray-300 px-3 py-2 outline-none focus:border-brand"
        />
      </div>

      <div>
        <label htmlFor="slug" className="text-sm font-medium text-neutral-800">
          Slug (URL)
        </label>
        <input
          id="slug"
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
          className="mt-1 w-full rounded-lg border border-brand-gray-300 px-3 py-2 font-mono text-sm outline-none focus:border-brand"
        />
      </div>

      <div>
        <label htmlFor="description" className="text-sm font-medium text-neutral-800">
          Descripción
        </label>
        <textarea
          id="description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 w-full rounded-lg border border-brand-gray-300 px-3 py-2 outline-none focus:border-brand"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="price" className="text-sm font-medium text-neutral-800">
            Precio
          </label>
          <input
            id="price"
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-1 w-full rounded-lg border border-brand-gray-300 px-3 py-2 outline-none focus:border-brand"
          />
        </div>
        <div>
          <label htmlFor="stock" className="text-sm font-medium text-neutral-800">
            Stock
          </label>
          <input
            id="stock"
            type="number"
            min={0}
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="mt-1 w-full rounded-lg border border-brand-gray-300 px-3 py-2 outline-none focus:border-brand"
          />
        </div>
      </div>

      <div>
        <label htmlFor="category" className="text-sm font-medium text-neutral-800">
          Categoría
        </label>
        <select
          id="category"
          value={categorySlug}
          onChange={(e) => setCategorySlug(e.target.value)}
          className="mt-1 w-full rounded-lg border border-brand-gray-300 px-3 py-2 outline-none focus:border-brand"
        >
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-neutral-800">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="h-4 w-4 rounded border-brand-gray-300"
        />
        Publicado (visible en el catálogo)
      </label>

      <div>
        <p className="text-sm font-semibold text-neutral-800">Variantes (opcional)</p>
        <p className="text-xs text-neutral-500">
          Ej: nombre &quot;Color&quot;, valor &quot;Rojo&quot;. Usá el mismo nombre para todas las
          opciones de un mismo producto.
        </p>
        <div className="mt-2 flex flex-col gap-2">
          {variants.map((v) => (
            <div key={v.key} className="flex flex-wrap items-center gap-2">
              <input
                placeholder="Nombre (Color)"
                value={v.name}
                onChange={(e) => updateVariant(v.key, { name: e.target.value })}
                className="w-32 rounded-lg border border-brand-gray-300 px-2 py-1.5 text-sm outline-none focus:border-brand"
              />
              <input
                placeholder="Valor (Rojo)"
                value={v.value}
                onChange={(e) => updateVariant(v.key, { value: e.target.value })}
                className="w-32 rounded-lg border border-brand-gray-300 px-2 py-1.5 text-sm outline-none focus:border-brand"
              />
              <input
                placeholder="Ajuste $"
                type="number"
                value={v.priceModifier}
                onChange={(e) => updateVariant(v.key, { priceModifier: e.target.value })}
                className="w-24 rounded-lg border border-brand-gray-300 px-2 py-1.5 text-sm outline-none focus:border-brand"
              />
              <input
                placeholder="Stock"
                type="number"
                value={v.stock}
                onChange={(e) => updateVariant(v.key, { stock: e.target.value })}
                className="w-20 rounded-lg border border-brand-gray-300 px-2 py-1.5 text-sm outline-none focus:border-brand"
              />
              <button
                type="button"
                onClick={() => setVariants((vs) => vs.filter((x) => x.key !== v.key))}
                className="text-sm text-neutral-400 hover:text-red-600"
              >
                Quitar
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setVariants((vs) => [...vs, newVariant()])}
          className="mt-2 text-sm font-medium text-brand hover:underline"
        >
          + Agregar variante
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 w-fit rounded-full bg-brand px-6 py-2.5 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Guardar"}
      </button>
    </form>
  );
}
