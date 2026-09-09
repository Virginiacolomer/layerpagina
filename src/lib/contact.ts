export const WHATSAPP_NUMBERS = [
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER_1,
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER_2,
].filter((n): n is string => Boolean(n));

export const INSTAGRAM_URL = process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "";

export function whatsappLink(number: string, message?: string) {
  const base = `https://wa.me/${number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

// Normaliza (best-effort) un teléfono que cargó el cliente al formato que
// espera wa.me para Argentina: 549 + característica + número, sin el 0 ni el
// 15. Si ya trae código de país, se deja como está.
export function waNumber(raw: string): string {
  let n = raw.replace(/\D/g, "");
  if (n.startsWith("54")) return n;
  n = n.replace(/^0/, "");
  n = n.replace(/^(\d{2,4})15(\d{6,8})$/, "$1$2");
  return `549${n}`;
}
