import type { Metadata } from "next";
import Link from "next/link";
import { getAllOrders } from "@/lib/data/orders";
import { OrderStatusSelect } from "@/components/order-status-select";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Pedidos | Admin Layer" };

export default async function AdminPedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ cliente?: string }>;
}) {
  const { cliente } = await searchParams;
  const orders = await getAllOrders(cliente);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Pedidos</h1>
        {cliente && (
          <Link href="/admin/pedidos" className="text-sm font-medium text-brand hover:underline">
            Ver todos
          </Link>
        )}
      </div>

      {orders.length === 0 ? (
        <p className="mt-4 text-neutral-500">Todavía no llegó ningún pedido.</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-brand-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-brand-gray-100 text-left text-neutral-600">
              <tr>
                <th className="px-4 py-3">Pedido</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-brand-gray-200">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/pedidos/${order.id}`}
                      className="font-medium text-brand hover:underline"
                    >
                      #{order.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p>{order.userName}</p>
                    <p className="text-xs text-neutral-500">{order.userEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {new Date(order.createdAt).toLocaleDateString("es-AR")}
                  </td>
                  <td className="px-4 py-3 font-medium">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3">
                    <OrderStatusSelect orderId={order.id} status={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
