import "server-only";
import { createClient } from "@supabase/supabase-js";

// Imágenes de producto en Supabase Storage. Se sube desde el panel de admin a
// través de una server action (nunca directo desde el cliente), así que se usa
// la service role key y todo queda del lado del servidor.
const BUCKET = "product-images";
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getClient() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Falta configurar SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY para subir imágenes.",
    );
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

let bucketReady = false;

async function ensureBucket(client: ReturnType<typeof getClient>) {
  if (bucketReady) return;
  const { data } = await client.storage.getBucket(BUCKET);
  if (!data) {
    await client.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: MAX_BYTES,
      allowedMimeTypes: ALLOWED_TYPES,
    });
  }
  bucketReady = true;
}

function extensionFor(type: string) {
  return type === "image/jpeg" ? "jpg" : type.replace("image/", "");
}

export function isUploadableImage(file: File): boolean {
  return ALLOWED_TYPES.includes(file.type) && file.size > 0 && file.size <= MAX_BYTES;
}

// Sube un archivo y devuelve su URL pública.
export async function uploadProductImage(productId: string, file: File): Promise<string> {
  if (!isUploadableImage(file)) {
    throw new Error("Cada imagen debe ser JPG, PNG, WebP o AVIF y pesar hasta 5 MB.");
  }
  const client = getClient();
  await ensureBucket(client);

  const objectPath = `${productId}/${crypto.randomUUID()}.${extensionFor(file.type)}`;
  const { error } = await client.storage.from(BUCKET).upload(objectPath, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw new Error(`No se pudo subir la imagen: ${error.message}`);

  return client.storage.from(BUCKET).getPublicUrl(objectPath).data.publicUrl;
}

// Borra una imagen a partir de su URL pública. No falla si ya no existe.
export async function deleteProductImageByUrl(url: string): Promise<void> {
  const marker = `/${BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return;
  const objectPath = url.slice(index + marker.length);

  const client = getClient();
  await client.storage.from(BUCKET).remove([objectPath]);
}
