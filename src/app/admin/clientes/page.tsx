import type { Metadata } from "next";
import Link from "next/link";
import { getAllCustomers } from "@/lib/data/users";
import { getOrdersByUser } from "@/lib/data/orders";
import { whatsappLink } from "@/lib/contact";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Clientes | Admin Layer" };

export default function AdminClientesPage() {
  const customers = getAllCustomers();

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">Clientes</h1>

      {customers.length === 0 ? (
        <p className="mt-4 text-neutral-500">Todavía no se registró ningún cliente.</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-brand-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-brand-gray-100 text-left text-neutral-600">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Pedidos</th>
                <th className="px-4 py-3">Total comprado</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => {
                const orders = getOrdersByUser(customer.id);
                const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
                const lastPhone = orders[0]?.shippingPhone;
                return (
                  <tr key={customer.id} className="border-t border-brand-gray-200">
                    <td className="px-4 py-3 font-medium text-neutral-900">{customer.name}</td>
                    <td className="px-4 py-3 text-neutral-600">{customer.email}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/pedidos?cliente=${customer.id}`}
                        className="text-brand hover:underline"
                      >
                        {orders.length}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{formatPrice(totalSpent)}</td>
                    <td className="px-4 py-3 text-right">
                      {lastPhone && (
                        <a
                          href={whatsappLink(lastPhone.replace(/\D/g, ""))}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-brand hover:underline"
                        >
                          WhatsApp
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
