// Datos para pagar por transferencia. No llevan prefijo NEXT_PUBLIC_ a
// propósito: sólo se leen en páginas server-side (ej. /pedido/[id]), no hace
// falta exponerlos en el bundle de cliente.
export const BANK_TRANSFER = {
  alias: process.env.BANK_ALIAS ?? "",
  cbu: process.env.BANK_CBU ?? "",
  holder: process.env.BANK_HOLDER ?? "",
};
