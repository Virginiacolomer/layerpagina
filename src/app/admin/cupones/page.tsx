import type { Metadata } from "next";
import { getAllCoupons } from "@/lib/data/coupons";
import {
  createCouponFormAction,
  toggleCouponFormAction,
  deleteCouponFormAction,
} from "@/lib/actions/admin-actions";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Cupones | Admin Layer" };

export default async function AdminCuponesPage() {
  const coupons = await getAllCoupons();

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">Cupones</h1>

      <form
        action={createCouponFormAction}
        className="mt-4 flex flex-wrap items-end gap-3 rounded-xl border border-brand-gray-200 p-4"
      >
        <div>
          <label htmlFor="code" className="text-sm font-medium text-neutral-800">
            Código
          </label>
          <input
            id="code"
            name="code"
            required
            placeholder="VERANO15"
            className="mt-1 w-36 rounded-lg border border-brand-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </div>
        <div>
          <label htmlFor="type" className="text-sm font-medium text-neutral-800">
            Tipo
          </label>
          <select
            id="type"
            name="type"
            className="mt-1 rounded-lg border border-brand-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
          >
            <option value="PERCENTAGE">% Porcentaje</option>
            <option value="FIXED">$ Monto fijo</option>
          </select>
        </div>
        <div>
          <label htmlFor="value" className="text-sm font-medium text-neutral-800">
            Valor
          </label>
          <input
            id="value"
            name="value"
            type="number"
            min={1}
            required
            className="mt-1 w-24 rounded-lg border border-brand-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </div>
        <div>
          <label htmlFor="minPurchase" className="text-sm font-medium text-neutral-800">
            Compra mínima (opcional)
          </label>
          <input
            id="minPurchase"
            name="minPurchase"
            type="number"
            min={0}
            className="mt-1 w-32 rounded-lg border border-brand-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </div>
        <button
          type="submit"
          className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Crear cupón
        </button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-xl border border-brand-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-brand-gray-100 text-left text-neutral-600">
            <tr>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Descuento</th>
              <th className="px-4 py-3">Compra mínima</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon.code} className="border-t border-brand-gray-200">
                <td className="px-4 py-3 font-mono font-medium text-neutral-900">
                  {coupon.code}
                </td>
                <td className="px-4 py-3">
                  {coupon.type === "PERCENTAGE" ? `${coupon.value}%` : formatPrice(coupon.value)}
                </td>
                <td className="px-4 py-3 text-neutral-600">
                  {coupon.minPurchase ? formatPrice(coupon.minPurchase) : "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      coupon.active
                        ? "bg-green-100 text-green-800"
                        : "bg-neutral-200 text-neutral-600"
                    }`}
                  >
                    {coupon.active ? "Activo" : "Desactivado"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3 text-sm">
                    <form action={toggleCouponFormAction}>
                      <input type="hidden" name="code" value={coupon.code} />
                      <button type="submit" className="font-medium text-brand hover:underline">
                        {coupon.active ? "Desactivar" : "Activar"}
                      </button>
                    </form>
                    <form action={deleteCouponFormAction}>
                      <input type="hidden" name="code" value={coupon.code} />
                      <button type="submit" className="text-neutral-400 hover:text-red-600">
                        Eliminar
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
