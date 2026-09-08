"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/catalog-types";
import { CATEGORIES, slugify } from "@/lib/categories";
import { createProductAction, updateProductAction } from "@/lib/actions/admin-actions";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

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

  // Fotos: las ya guardadas se llevan como URLs; las nuevas como File hasta
  // que se envía el formulario (la subida a Storage la hace la server action).
  const [keptImages, setKeptImages] = useState<string[]>(product?.images ?? []);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const newPreviews = useMemo(
    () => newFiles.map((file) => URL.createObjectURL(file)),
    [newFiles],
  );
  useEffect(() => {
    return () => newPreviews.forEach((url) => URL.revokeObjectURL(url));
  }, [newPreviews]);

  function handleFilesSelected(fileList: FileList | null) {
    if (!fileList) return;
    const picked = Array.from(fileList);
    const invalid = picked.find(
      (f) => !ACCEPTED_IMAGE_TYPES.includes(f.type) || f.size > MAX_IMAGE_BYTES,
    );
    if (invalid) {
      setError("Cada foto debe ser JPG, PNG, WebP o AVIF y pesar hasta 5 MB.");
      return;
    }
    setError(null);
    setNewFiles((prev) => [...prev, ...picked]);
  }

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
        ? await updateProductAction(product.id, input, keptImages, newFiles)
        : await createProductAction(input, newFiles);
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

      <div>
        <p className="text-sm font-medium text-neutral-800">Fotos</p>
        <p className="text-xs text-neutral-500">
          JPG, PNG, WebP o AVIF, hasta 5 MB. La primera es la principal.
        </p>

        {(keptImages.length > 0 || newFiles.length > 0) && (
          <div className="mt-2 flex flex-wrap gap-3">
            {keptImages.map((url) => (
              <div key={url} className="relative h-24 w-24 overflow-hidden rounded-lg border border-brand-gray-200">
                <Image src={url} alt="" fill sizes="96px" className="object-cover" />
                <button
                  type="button"
                  onClick={() => setKeptImages((prev) => prev.filter((u) => u !== url))}
                  className="absolute right-1 top-1 rounded-full bg-white/90 px-1.5 text-xs font-bold text-neutral-700 hover:text-red-600"
                  aria-label="Quitar foto"
                >
                  ×
                </button>
              </div>
            ))}
            {newFiles.map((file, i) => (
              <div
                key={`${file.name}-${i}`}
                className="relative h-24 w-24 overflow-hidden rounded-lg border border-dashed border-brand"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={newPreviews[i]} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setNewFiles((prev) => prev.filter((_, idx) => idx !== i))}
                  className="absolute right-1 top-1 rounded-full bg-white/90 px-1.5 text-xs font-bold text-neutral-700 hover:text-red-600"
                  aria-label="Quitar foto"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <input
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
          multiple
          onChange={(e) => {
            handleFilesSelected(e.target.files);
            e.target.value = "";
          }}
          className="mt-2 block text-sm text-neutral-600 file:mr-3 file:rounded-full file:border-0 file:bg-brand-gray-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-neutral-700 hover:file:bg-brand-gray-200"
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
