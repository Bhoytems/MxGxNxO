// Client-side Firebase Storage helpers for product images.
// Storage rules (storage.rules) restrict writes under products/** to the admin.
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "@/lib/firebase";

/**
 * Uploads a single image file to Storage under products/{productId}/ and
 * returns its public download URL. Pass "temp" as productId while importing
 * a product that hasn't been saved yet — the file still gets a stable path.
 */
export async function uploadProductImage(file: File, productId: string): Promise<string> {
  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
  const imageRef = ref(storage, `products/${productId}/${safeName}`);
  await uploadBytes(imageRef, file);
  return getDownloadURL(imageRef);
}

export async function uploadProductImages(files: File[], productId: string): Promise<string[]> {
  return Promise.all(files.map((file) => uploadProductImage(file, productId)));
}

/**
 * Deletes an uploaded image from Storage given its download URL.
 * Silently no-ops on URLs that aren't ours (e.g. scraped supplier image URLs
 * that were never uploaded to our bucket) since those can't be deleted here.
 */
export async function deleteProductImage(url: string): Promise<void> {
  if (!url.includes("firebasestorage.googleapis.com") && !url.includes("firebasestorage.app")) {
    return;
  }
  try {
    const imageRef = ref(storage, url);
    await deleteObject(imageRef);
  } catch {
    // Already deleted or URL didn't resolve to a valid Storage path — ignore.
  }
}
