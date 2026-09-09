// Estados de un pedido, con su etiqueta y color. Fuente única para el panel,
// el perfil del cliente y el modelo de datos.

export const ORDER_STATUSES = [
  "PENDING",
  "PAID",
  "PREPARING",
  "READY",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

export type OrderStatusValue = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatusValue, string> = {
  PENDING: "Pendiente de pago",
  PAID: "Pago confirmado",
  PREPARING: "En preparación",
  READY: "Listo para entregar",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

export const ORDER_STATUS_COLORS: Record<OrderStatusValue, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  PAID: "bg-blue-100 text-blue-800",
  PREPARING: "bg-blue-100 text-blue-800",
  READY: "bg-teal-100 text-teal-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-neutral-200 text-neutral-600",
};

export function orderStatusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status as OrderStatusValue] ?? status;
}

// Mensaje de WhatsApp ya redactado para avisarle al cliente cuando el pedido
// entra a un estado que le interesa. Devuelve null si ese estado es solo para
// control interno (Pendiente, En preparación, Enviado, Entregado, Cancelado):
// en ese caso no se le avisa nada al cliente.
export function orderStatusCustomerMessage(
  status: string,
  order: { id: string; firstName: string },
): string | null {
  const { id, firstName } = order;
  switch (status) {
    case "PAID":
      return `Hola ${firstName}! Confirmamos el pago de tu pedido #${id} en Layer ✅. Ya lo pusimos en preparación y te avisamos apenas esté listo. ¡Gracias por tu compra!`;
    case "READY":
      return `Hola ${firstName}! Tu pedido #${id} en Layer ya está listo 🎉. Coordinamos por acá el envío o retiro. ¡Gracias!`;
    default:
      return null;
  }
}
