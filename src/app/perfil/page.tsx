import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { getOrdersByUser } from "@/lib/data/orders";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Mi cuenta | Layer" };

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  PAID: "Pagado",
  PREPARING: "En preparación",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

export default async function PerfilPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const orders = await getOrdersByUser(session.user.id);

  return (
    <div className="mx-auto w-full max-w-lg flex-1 px-6 py-16">
      <h1 className="text-2xl font-bold text-neutral-900">Mi cuenta</h1>

      <div className="mt-6 rounded-xl border border-brand-gray-200 p-5">
        <p className="text-sm text-neutral-500">Nombre</p>
        <p className="font-medium text-neutral-900">{session.user.name}</p>
        <p className="mt-3 text-sm text-neutral-500">Email</p>
        <p className="font-medium text-neutral-900">{session.user.email}</p>
      </div>

      <div className="mt-6 rounded-xl border border-brand-gray-200 p-5">
        <p className="font-medium text-neutral-900">Mis pedidos</p>
        {orders.length === 0 ? (
          <p className="mt-1 text-sm text-neutral-500">Todavía no hiciste ningún pedido.</p>
        ) : (
          <div className="mt-3 flex flex-col gap-3">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/pedido/${order.id}`}
                className="flex items-center justify-between rounded-lg border border-brand-gray-200 px-4 py-3 text-sm hover:border-brand"
              >
                <div>
                  <p className="font-medium text-neutral-900">Pedido #{order.id}</p>
                  <p className="text-neutral-500">
                    {new Date(order.createdAt).toLocaleDateString("es-AR")} ·{" "}
                    {STATUS_LABELS[order.status] ?? order.status}
                  </p>
                </div>
                <p className="font-semibold text-brand">{formatPrice(order.total)}</p>
              </Link>
            ))}
          </div>
        )}
      </div>

      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
        className="mt-6"
      >
        <button
          type="submit"
          className="rounded-full border border-brand-gray-300 px-5 py-2 text-sm font-semibold text-neutral-700 transition hover:border-brand hover:text-brand"
        >
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}
