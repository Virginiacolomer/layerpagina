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
  "Dioramas",
  "Funko Pop personalizados",
  "Llaveros",
  "Hogar y decoración",
  "Organizadores de escritorio",
  "Productos para eventos",
  "Juguetes para mascotas",
  "Comederos para mascotas",
] as const;

export const CATEGORIES = CATEGORY_NAMES.map((name) => ({
  name,
  slug: slugify(name),
}));
