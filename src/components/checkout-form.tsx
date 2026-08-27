"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { resolveCartLines } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { placeOrderAction } from "@/lib/actions/checkout-actions";

export function CheckoutForm({ defaultName }: { defaultName: string }) {
  const cart = useCart();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [shipping, setShipping] = useState({
    name: defaultName,
    phone: "",
    street: "",
    city: "",
    province: "",
    postalCode: "",
  });

  const resolvedLines = resolveCartLines(cart.lines);
  const total = cart.subtotal - cart.discount;

  if (resolvedLines.length === 0) {
    return (
      <div className="mt-6 flex flex-col items-start gap-3">
        <p className="text-neutral-600">Tu carrito está vacío.</p>
        <Link href="/productos" className="font-medium text-brand hover:underline">
          Ver catálogo
        </Link>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await placeOrderAction(cart.lines, cart.couponCode, shipping);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      cart.clear();
      router.push(`/pedido/${result.orderId}`);
    });
  }

  return (
    <div className="mt-6 grid gap-8 sm:grid-cols-2">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="name" className="text-sm font-medium text-neutral-800">
            Nombre y apellido
          </label>
          <input
            id="name"
            required
            value={shipping.name}
            onChange={(e) => setShipping((s) => ({ ...s, name: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-brand-gray-300 px-3 py-2 outline-none focus:border-brand"
          />
        </div>
        <div>
          <label htmlFor="phone" className="text-sm font-medium text-neutral-800">
            Teléfono
          </label>
          <input
            id="phone"
            required
            value={shipping.phone}
            onChange={(e) => setShipping((s) => ({ ...s, phone: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-brand-gray-300 px-3 py-2 outline-none focus:border-brand"
          />
        </div>
        <div>
          <label htmlFor="street" className="text-sm font-medium text-neutral-800">
            Dirección
          </label>
          <input
            id="street"
            required
            value={shipping.street}
            onChange={(e) => setShipping((s) => ({ ...s, street: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-brand-gray-300 px-3 py-2 outline-none focus:border-brand"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="city" className="text-sm font-medium text-neutral-800">
              Ciudad
            </label>
            <input
              id="city"
              required
              value={shipping.city}
              onChange={(e) => setShipping((s) => ({ ...s, city: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-brand-gray-300 px-3 py-2 outline-none focus:border-brand"
            />
          </div>
          <div>
            <label htmlFor="province" className="text-sm font-medium text-neutral-800">
              Provincia
            </label>
            <input
              id="province"
              required
              value={shipping.province}
              onChange={(e) => setShipping((s) => ({ ...s, province: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-brand-gray-300 px-3 py-2 outline-none focus:border-brand"
            />
          </div>
        </div>
        <div>
          <label htmlFor="postalCode" className="text-sm font-medium text-neutral-800">
            Código postal
          </label>
          <input
            id="postalCode"
            required
            value={shipping.postalCode}
            onChange={(e) => setShipping((s) => ({ ...s, postalCode: e.target.value }))}
            className="mt-1 w-full max-w-[10rem] rounded-lg border border-brand-gray-300 px-3 py-2 outline-none focus:border-brand"
          />
        </div>

        <p className="text-sm text-neutral-500">
          El pago se hace por transferencia — te vamos a mostrar el alias al confirmar. El costo y
          método de envío (Correo Argentino o Andreani) se coordina por WhatsApp una vez
          confirmado el pago.
        </p>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="mt-2 w-fit rounded-full bg-brand px-6 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Confirmando…" : "Confirmar pedido"}
        </button>
      </form>

      <div className="h-fit rounded-xl border border-brand-gray-200 p-5">
        <p className="font-semibold text-neutral-900">Tu pedido</p>
        <div className="mt-3 flex flex-col gap-2">
          {resolvedLines.map((line) => (
            <div
              key={`${line.product.id}:${line.variant?.id ?? ""}`}
              className="flex justify-between text-sm text-neutral-700"
            >
              <span>
                {line.product.name}
                {line.variant ? ` (${line.variant.value})` : ""} × {line.quantity}
              </span>
              <span>{formatPrice(line.lineTotal)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-1 border-t border-brand-gray-200 pt-3 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatPrice(cart.subtotal)}</span>
          </div>
          {cart.discount > 0 && (
            <div className="flex justify-between text-brand">
              <span>Descuento {cart.couponCode ? `(${cart.couponCode})` : ""}</span>
              <span>−{formatPrice(cart.discount)}</span>
            </div>
          )}
          <div className="flex justify-between pt-1 text-base font-bold text-neutral-900">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
