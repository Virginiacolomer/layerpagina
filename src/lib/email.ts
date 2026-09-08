import { Resend } from "resend";
import type { Order } from "@/lib/data/orders";
import { formatPrice } from "@/lib/format";

const adminEmails = (process.env.ADMIN_NOTIFICATION_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);

// Si no hay API key configurada (todavía no se creó la cuenta de Resend),
// no falla el checkout: sólo deja constancia en el log del servidor. Ver
// RESEND_API_KEY en .env.example.
export async function sendNewOrderEmail(order: Order) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || adminEmails.length === 0) {
    console.log(`[email] RESEND_API_KEY no configurada — se omite el aviso del pedido #${order.id}.`);
    return;
  }

  const itemsHtml = order.items
    .map(
      (item) =>
        `<li>${item.productName}${item.variantLabel ? ` (${item.variantLabel})` : ""} × ${item.quantity} — ${formatPrice(item.unitPrice * item.quantity)}</li>`,
    )
    .join("");

  const resend = new Resend(apiKey);
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM ?? "pedidos@layer.com",
      to: adminEmails,
      subject: `Nuevo pedido #${order.id} — ${formatPrice(order.total)}`,
      html: `
        <h2>Nuevo pedido de ${order.userName}</h2>
        <p>${order.userEmail} · ${order.shippingPhone}</p>
        <ul>${itemsHtml}</ul>
        <p><strong>Total: ${formatPrice(order.total)}</strong></p>
        <p>Envío a: ${order.shippingStreet}, ${order.shippingCity}, ${order.shippingProvince} (${order.shippingPostalCode})</p>
      `,
    });
  } catch (error) {
    console.error(`[email] No se pudo enviar el aviso del pedido #${order.id}:`, error);
  }
}
