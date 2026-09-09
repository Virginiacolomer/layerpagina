"use client";

import { useState, useTransition } from "react";
import { changeOrderStatus } from "@/lib/actions/admin-actions";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  type OrderStatusValue,
} from "@/lib/order-status";

// Selector de estado que guarda al cambiar (sin botón). Se usa en la lista de
// pedidos y en el detalle.
export function OrderStatusSelect({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatusValue;
}) {
  const [value, setValue] = useState<OrderStatusValue>(status);
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={value}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value as OrderStatusValue;
        setValue(next);
        startTransition(() => changeOrderStatus(orderId, next));
      }}
      className="rounded-lg border border-brand-gray-300 px-2 py-1 text-sm outline-none focus:border-brand disabled:opacity-50"
    >
      {ORDER_STATUSES.map((s) => (
        <option key={s} value={s}>
          {ORDER_STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  );
}
