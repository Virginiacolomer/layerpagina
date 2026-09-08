import type { Metadata } from "next";
import Link from "next/link";
import { getAllOrders } from "@/lib/data/orders";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Pedidos | Admin Layer" };

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  PAID: "Pagado",
  PREPARING: "En preparación",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  PAID: "bg-blue-100 text-blue-800",
  PREPARING: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-neutral-200 text-neutral-600",
};

export default async function AdminPedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ cliente?: string }>;
}) {
  const { cliente } = await searchParams;
  const allOrders = getAllOrders();
  const orders = cliente ? allOrders.filter((o) => o.userId === cliente) : allOrders;

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
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLORS[order.status] ?? "bg-neutral-100 text-neutral-700"}`}
                    >
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
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
