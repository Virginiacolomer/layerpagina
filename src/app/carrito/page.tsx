"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { ProductImage } from "@/components/product-image";
import { ColorList } from "@/components/color-list";
import { formatPrice } from "@/lib/format";

export default function CarritoPage() {
  const cart = useCart();
  const [couponInput, setCouponInput] = useState("");
  const resolvedLines = cart.resolvedLines;
  const total = cart.subtotal - cart.discount;

  if (cart.lines.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-4 px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-neutral-900">Tu carrito está vacío</h1>
        <Link
          href="/productos"
          className="rounded-full bg-brand px-6 py-3 font-semibold text-white transition hover:opacity-90"
        >
          Ver catálogo
        </Link>
      </div>
    );
  }

  if (!cart.pricesLoaded) {
    return (
      <div className="mx-auto w-full max-w-4xl px-6 py-10">
        <h1 className="text-3xl font-bold text-neutral-900">Tu carrito</h1>
        <p className="mt-6 text-neutral-500">Cargando…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-bold text-neutral-900">Tu carrito</h1>

      <div className="mt-6 flex flex-col gap-4">
        {resolvedLines.map((line) => {
          const ref = {
            productId: line.product.id,
            variantId: line.variant?.id,
            colors: line.colors,
          };
          return (
            <div
              key={`${line.product.id}:${line.variant?.id ?? ""}:${line.colors.join("|")}`}
              className="flex items-center gap-4 rounded-xl border border-brand-gray-200 p-4"
            >
              <div className="w-20 shrink-0">
                <ProductImage
                  src={line.product.images[0]}
                  alt={line.product.name}
                  seed={line.product.id}
                  sizes="80px"
                />
              </div>

              <div className="flex-1">
                <p className="font-semibold text-neutral-900">{line.product.name}</p>
                {line.variant && (
                  <p className="text-sm text-neutral-500">{line.variant.value}</p>
                )}
                {line.colors.length > 0 && <ColorList colors={line.colors} />}
                <p className="mt-1 font-medium text-brand">{formatPrice(line.unitPrice)}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => cart.setQuantity(ref, line.quantity - 1)}
                  className="h-8 w-8 rounded-full border border-brand-gray-300 text-neutral-600 hover:border-brand hover:text-brand"
                  aria-label="Restar cantidad"
                >
                  −
                </button>
                <span className="w-6 text-center">{line.quantity}</span>
                <button
                  type="button"
                  onClick={() => cart.setQuantity(ref, line.quantity + 1)}
                  className="h-8 w-8 rounded-full border border-brand-gray-300 text-neutral-600 hover:border-brand hover:text-brand"
                  aria-label="Sumar cantidad"
                >
                  +
                </button>
              </div>

              <p className="w-24 text-right font-semibold text-neutral-900">
                {formatPrice(line.lineTotal)}
              </p>

              <button
                type="button"
                onClick={() => cart.removeItem(ref)}
                className="text-sm text-neutral-400 hover:text-red-600"
                aria-label={`Quitar ${line.product.name}`}
              >
                Quitar
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex flex-col items-end gap-4">
        <div className="w-full max-w-sm">
          {cart.couponCode ? (
            <div className="flex items-center justify-between rounded-lg bg-brand-gray-100 px-4 py-3 text-sm">
              <span>
                Cupón <strong>{cart.couponCode}</strong> aplicado
              </span>
              <button
                type="button"
                onClick={cart.removeCoupon}
                className="text-neutral-500 hover:text-red-600"
              >
                Quitar
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (couponInput.trim()) cart.applyCoupon(couponInput);
              }}
              className="flex gap-2"
            >
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="Código de cupón"
                className="flex-1 rounded-lg border border-brand-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
              />
              <button
                type="submit"
                disabled={cart.applyingCoupon}
                className="rounded-lg border border-brand-gray-300 px-4 py-2 text-sm font-semibold text-neutral-700 hover:border-brand hover:text-brand disabled:opacity-60"
              >
                {cart.applyingCoupon ? "Validando…" : "Aplicar"}
              </button>
            </form>
          )}
          {cart.couponError && (
            <p className="mt-1 text-sm text-red-600">{cart.couponError}</p>
          )}
        </div>

        <div className="w-full max-w-sm space-y-1 text-sm text-neutral-700">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatPrice(cart.subtotal)}</span>
          </div>
          {cart.discount > 0 && (
            <div className="flex justify-between text-brand">
              <span>Descuento</span>
              <span>−{formatPrice(cart.discount)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-brand-gray-200 pt-2 text-base font-bold text-neutral-900">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>

        <Link
          href="/checkout"
          className="rounded-full bg-brand px-6 py-3 font-semibold text-white transition hover:opacity-90"
        >
          Ir a pagar
        </Link>
      </div>
    </div>
  );
}
