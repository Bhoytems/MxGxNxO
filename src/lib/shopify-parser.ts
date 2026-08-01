// Parses a Shopify storefront's public /products/[handle].json feed into
// our internal ImportedProductData shape. This is the "Product Importer" engine.
import { ImportedProductData, ProductVariant } from "@/types";

/**
 * Normalizes a pasted product URL into its Shopify JSON endpoint.
 * Accepts URLs like:
 *   https://store.myshopify.com/products/cool-item
 *   https://store.com/products/cool-item?variant=123
 * and returns:
 *   https://store.myshopify.com/products/cool-item.json
 */
export function toShopifyJsonUrl(rawUrl: string): string {
  const url = new URL(rawUrl);
  url.search = "";
  url.hash = "";
  if (!url.pathname.endsWith(".json")) {
    url.pathname = url.pathname.replace(/\/$/, "") + ".json";
  }
  return url.toString();
}

interface ShopifyJsonResponse {
  product: {
    title: string;
    body_html: string;
    images: { src: string }[];
    variants: {
      id: number;
      title: string;
      price: string;
      sku: string;
      available: boolean;
    }[];
  };
}

/** Strips HTML tags down to plain text for a cleaner editable description. */
function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Fetches a Shopify product's public JSON feed and normalizes it.
 * Throws a descriptive error if the URL isn't a valid Shopify product page.
 */
export async function fetchShopifyProduct(rawUrl: string): Promise<ImportedProductData> {
  let jsonUrl: string;
  try {
    jsonUrl = toShopifyJsonUrl(rawUrl);
  } catch {
    throw new Error("That doesn't look like a valid URL.");
  }

  const res = await fetch(jsonUrl, {
    headers: { "User-Agent": "Mozilla/5.0 (Magnifico Importer)" },
    // Shopify product JSON is public — no auth needed.
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(
      `Couldn't fetch product data (${res.status}). Make sure this is a live Shopify product page.`
    );
  }

  let data: ShopifyJsonResponse;
  try {
    data = await res.json();
  } catch {
    throw new Error("This page didn't return Shopify product JSON. Is it really a Shopify store?");
  }

  const product = data?.product;
  if (!product || !product.title) {
    throw new Error("No product data found at that URL.");
  }

  const variants: ProductVariant[] = (product.variants || []).map((v) => ({
    id: String(v.id),
    title: v.title || "Default",
    price: parseFloat(v.price) || 0,
    sku: v.sku || undefined,
    available: v.available ?? true,
  }));

  const supplierPrice = variants.length
    ? Math.min(...variants.map((v) => v.price))
    : 0;

  return {
    title: product.title,
    description: stripHtml(product.body_html || ""),
    images: (product.images || []).map((img) => img.src),
    variants,
    supplierPrice,
    sourceUrl: rawUrl,
  };
}
