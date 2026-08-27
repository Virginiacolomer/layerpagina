export const WHATSAPP_NUMBERS = [
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER_1,
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER_2,
].filter((n): n is string => Boolean(n));

export const INSTAGRAM_URL = process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "";

export function whatsappLink(number: string, message?: string) {
  const base = `https://wa.me/${number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
