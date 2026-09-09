"use client";

import { useState, useTransition } from "react";
import { changeOrderStatus } from "@/lib/actions/admin-actions";
import { whatsappLink } from "@/lib/contact";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  orderStatusCustomerMessage,
  type OrderStatusValue,
} from "@/lib/order-status";

// Selector de estado que guarda al cambiar (sin botón). Se usa en la lista de
// pedidos y en el detalle. Cuando el estado elegido tiene un aviso para el
// cliente (Pago confirmado, Listo para entregar) muestra un botón que abre
// WhatsApp con el mensaje ya redactado; el admin solo lo revisa y envía.
export function OrderStatusSelect({
  orderId,
  status,
  customerFirstName,
  customerPhone,
  variant = "inline",
}: {
  orderId: string;
  status: OrderStatusValue;
  customerFirstName: string;
  customerPhone: string;
  variant?: "inline" | "full";
}) {
  const [value, setValue] = useState<OrderStatusValue>(status);
  const [pending, startTransition] = useTransition();

  const message = orderStatusCustomerMessage(value, {
    id: orderId,
    firstName: customerFirstName,
  });
  const showNotice = message && !pending;

  return (
    <div className="flex flex-col items-start gap-2">
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

      {showNotice && variant === "inline" && (
        <a
          href={whatsappLink(customerPhone, message)}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white transition hover:opacity-90"
        >
          Avisar por WhatsApp
        </a>
      )}

      {showNotice && variant === "full" && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-semibold text-green-900">
            Avisale al cliente el cambio de estado
          </p>
          <p className="mt-1 text-sm text-green-800">
            Se abre WhatsApp con este mensaje: “{message}”
          </p>
          <a
            href={whatsappLink(customerPhone, message)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Avisar por WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}
