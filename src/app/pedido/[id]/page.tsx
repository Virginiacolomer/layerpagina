import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getOrderById } from "@/lib/data/orders";
import { WHATSAPP_NUMBERS, whatsappLink } from "@/lib/contact";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Pedido confirmado | Layer" };

export default async function PedidoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const order = getOrderById(id);
  if (!order || order.userId !== session.user.id) notFound();

  const whatsappMessage = `Hola! Quiero coordinar el pago y envío de mi pedido #${order.id} (total ${formatPrice(order.total)}).`;

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10">
      <h1 className="text-3xl font-bold text-neutral-900">¡Gracias por tu pedido!</h1>
      <p className="mt-2 text-neutral-600">
        Registramos tu pedido <strong>#{order.id}</strong>. Te vamos a escribir por WhatsApp para
        coordinar el pago y el envío (Correo Argentino o Andreani).
      </p>

      <div className="mt-6 rounded-xl border border-brand-gray-200 p-5">
        <p className="font-semibold text-neutral-900">Resumen</p>
        <div className="mt-3 flex flex-col gap-2">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm text-neutral-700">
              <span>
                {item.productName}
                {item.variantLabel ? ` (${item.variantLabel})` : ""} × {item.quantity}
              </span>
              <span>{formatPrice(item.unitPrice * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-1 border-t border-brand-gray-200 pt-3 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-brand">
              <span>Descuento {order.couponCode ? `(${order.couponCode})` : ""}</span>
              <span>−{formatPrice(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between pt-1 text-base font-bold text-neutral-900">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-brand-gray-200 p-5 text-sm text-neutral-700">
        <p className="font-semibold text-neutral-900">Envío a</p>
        <p className="mt-1">{order.shippingName}</p>
        <p>
          {order.shippingStreet}, {order.shippingCity}, {order.shippingProvince} (
          {order.shippingPostalCode})
        </p>
        <p>{order.shippingPhone}</p>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        {WHATSAPP_NUMBERS[0] && (
          <a
            href={whatsappLink(WHATSAPP_NUMBERS[0], whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-brand px-6 py-3 font-semibold text-white transition hover:opacity-90"
          >
            Coordinar por WhatsApp
          </a>
        )}
        <Link
          href="/productos"
          className="rounded-full border border-brand-gray-300 px-6 py-3 font-semibold text-neutral-700 transition hover:border-brand hover:text-brand"
        >
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}
