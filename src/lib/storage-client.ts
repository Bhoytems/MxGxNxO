// Client-side Supabase Storage helpers for product images.
// Storage policies (supabase/storage.sql) restrict writes to the admin.
import { supabase } from "@/lib/supabase";

const BUCKET = "products";

/**
 * Uploads a single image file to the "products" bucket under {productId}/
 * and returns its public URL. Pass a temp ID while importing a product that
 * hasn't been saved yet.
 */
export async function uploadProductImage(file: File, productId: string): Promise<string> {
  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
  const path = `${productId}/${safeName}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadProductImages(files: File[], productId: string): Promise<string[]> {
  return Promise.all(files.map((file) => uploadProductImage(file, productId)));
}

/**
 * Deletes an uploaded image given its public URL. Silently no-ops on URLs
 * that aren't from our bucket (e.g. scraped supplier image URLs).
 */
export async function deleteProductImage(url: string): Promise<void> {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return; // not one of our uploads — nothing to delete

  const path = url.slice(idx + marker.length);
  try {
    await supabase.storage.from(BUCKET).remove([path]);
  } catch {
    // Already deleted or path didn't resolve — ignore.
  }
}
