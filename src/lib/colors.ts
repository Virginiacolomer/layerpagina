// Paleta fija de filamentos que puede elegir el cliente. El admin define, por
// producto, cuántos colores hay que elegir (Product.colorCount); si es 0 el
// producto no pide color.

export type PaletteColor = { name: string; hex: string };

export const COLOR_PALETTE: PaletteColor[] = [
  { name: "Marrón oscuro", hex: "#4D2C1D" },
  { name: "Marrón rojizo / Terracota", hex: "#80412B" },
  { name: "Cobre / Bronce", hex: "#824B35" },
  { name: "Madera clara / Beige", hex: "#A88B68" },
  { name: "Dorado / Verde oliva", hex: "#96803C" },
  { name: "Crema / Piel", hex: "#E2C2A6" },
  { name: "Rojo", hex: "#B6352E" },
  { name: "Naranja", hex: "#DC5622" },
  { name: "Amarillo", hex: "#ECC218" },
  { name: "Amarillo claro / Marfil", hex: "#E5D9A1" },
  { name: "Blanco perlado / Translúcido", hex: "#DDDEDF" },
  { name: "Blanco", hex: "#F0F0F0" },
  { name: "Plata / Gris claro", hex: "#A2A4A7" },
  { name: "Gris medio", hex: "#707376" },
  { name: "Gris oscuro / Grafito", hex: "#4A4D50" },
  { name: "Negro", hex: "#1A1A1A" },
  { name: "Rosa claro / Pastel", hex: "#E8A2A5" },
  { name: "Lila / Violeta claro", hex: "#AA7FB1" },
  { name: "Púrpura / Morado", hex: "#4E2A7A" },
  { name: "Azul oscuro / Marino", hex: "#202D71" },
  { name: "Azul Francia", hex: "#1841AA" },
  { name: "Azul claro / Celeste", hex: "#3D7FC1" },
  { name: "Celeste pastel", hex: "#8BBFE0" },
  { name: "Verde agua / Menta", hex: "#86CCA6" },
  { name: "Verde brillante", hex: "#4EA849" },
  { name: "Verde militar / Oscuro", hex: "#3A5128" },
];

const HEX_BY_NAME = new Map(COLOR_PALETTE.map((c) => [c.name, c.hex]));

export function hexForColor(name: string): string {
  return HEX_BY_NAME.get(name) ?? "#D4D4D4";
}

export function isPaletteColor(name: string): boolean {
  return HEX_BY_NAME.has(name);
}
