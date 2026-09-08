// Achica las fotos en el navegador antes de subirlas: baja el peso de varios MB
// a unos cientos de KB. Importante para el deploy en Vercel, donde el body de
// una server action no puede pasar de ~4,5 MB.

const MAX_EDGE = 1600;
const QUALITY = 0.82;

export type ResizeResult =
  | { ok: true; file: File }
  | { ok: false; reason: string };

export async function downscaleImage(file: File): Promise<ResizeResult> {
  if (!file.type.startsWith("image/")) {
    return { ok: false, reason: "El archivo no es una imagen." };
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    // El navegador no pudo decodificarla: la dejamos pasar tal cual y que
    // decida el servidor / Supabase.
    return file.size <= 4 * 1024 * 1024
      ? { ok: true, file }
      : { ok: false, reason: "No se pudo procesar esa imagen y es muy pesada." };
  }

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return { ok: true, file };
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", QUALITY),
  );
  if (!blob) return { ok: true, file };

  // Si comprimir no ayudó (ya venía optimizada y chica), usamos el original.
  const chosen = blob.size < file.size ? blob : file;
  if (chosen.size > 4 * 1024 * 1024) {
    return { ok: false, reason: "Esa foto sigue siendo muy pesada, probá con una más chica." };
  }

  if (chosen === file) return { ok: true, file };
  const name = file.name.replace(/\.[^.]+$/, "") + ".webp";
  return { ok: true, file: new File([blob], name, { type: "image/webp" }) };
}
