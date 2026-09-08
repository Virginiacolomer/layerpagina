export function slugify(name: string) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const CATEGORY_NAMES = [
  "Personajes",
  "Personalizados",
  "Hogar y decoración",
  "Organizadores de escritorio",
  "Juegos didácticos",
  "Aviones",
] as const;

// Categorías cuyos productos NO se compran online: sólo se consultan por
// WhatsApp (no muestran "agregar al carrito").
const CONSULT_ONLY_NAMES: string[] = ["Personalizados"];

export type Category = {
  name: string;
  slug: string;
  consultOnly: boolean;
};

export const CATEGORIES: Category[] = CATEGORY_NAMES.map((name) => ({
  name,
  slug: slugify(name),
  consultOnly: CONSULT_ONLY_NAMES.includes(name),
}));

export const CONSULT_ONLY_CATEGORY_SLUGS = new Set(
  CATEGORIES.filter((c) => c.consultOnly).map((c) => c.slug),
);
