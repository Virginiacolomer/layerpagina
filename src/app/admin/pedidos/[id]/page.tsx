import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/data/orders";
import { OrderStatusSelect } from "@/components/order-status-select";
import { ColorList } from "@/components/color-list";
import { formatPrice } from "@/lib/format";
import { whatsappLink, waNumber } from "@/lib/contact";

export const metadata: Metadata = { title: "Pedido | Admin Layer" };

export default async function AdminPedidoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  const phone = waNumber(order.shippingPhone);
  const firstName = order.userName.split(" ")[0];

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">Pedido #{order.id}</h1>
      <p className="text-sm text-neutral-500">
        {new Date(order.createdAt).toLocaleString("es-AR")}
      </p>

      <div className="mt-6">
        <p className="text-sm font-medium text-neutral-800">Estado del pedido</p>
        <div className="mt-1">
          <OrderStatusSelect
            orderId={order.id}
            status={order.status}
            customerFirstName={firstName}
            customerPhone={phone}
            variant="full"
          />
        </div>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-brand-gray-200 p-5">
          <p className="font-semibold text-neutral-900">Cliente</p>
          <p className="mt-1 text-sm text-neutral-700">{order.userName}</p>
          <p className="text-sm text-neutral-700">{order.userEmail}</p>
          <p className="text-sm text-neutral-700">{order.shippingPhone}</p>
          <a
            href={whatsappLink(phone, `Hola ${firstName}! Te escribo por tu pedido #${order.id}.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Escribir por WhatsApp
          </a>
        </div>

        <div className="rounded-xl border border-brand-gray-200 p-5">
          <p className="font-semibold text-neutral-900">Envío a</p>
          <p className="mt-1 text-sm text-neutral-700">
            {order.shippingStreet}, {order.shippingCity}, {order.shippingProvince} (
            {order.shippingPostalCode})
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-brand-gray-200 p-5">
        <p className="font-semibold text-neutral-900">Productos</p>
        <div className="mt-3 flex flex-col gap-2">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm text-neutral-700">
              <span>
                {item.productName}
                {item.variantLabel ? ` (${item.variantLabel})` : ""} × {item.quantity}
                {item.colors.length > 0 && (
                  <ColorList colors={item.colors} className="mt-0.5 block" />
                )}
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
    </div>
  );
}
