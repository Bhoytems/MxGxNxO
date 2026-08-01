// Best-effort AliExpress product scraper.
//
// IMPORTANT CAVEAT: unlike Shopify, AliExpress has no public product JSON API.
// This falls back to scraping Open Graph tags + inline JSON blobs from the
// rendered HTML, which AliExpress frequently changes and aggressively
// rate-limits/blocks from server IPs. Treat this as "works often, not always."
// For production-grade reliability, use AliExpress's official Affiliate/Dropshipping
// API (requires an approved partner account) instead of scraping.
import * as cheerio from "cheerio";
import { ImportedProductData, ProductVariant } from "@/types";

export function isAliExpressUrl(url: string): boolean {
  return /aliexpress\.(com|us)/i.test(url);
}

export async function fetchAliExpressProduct(rawUrl: string): Promise<ImportedProductData> {
  const res = await fetch(rawUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(
      `Couldn't load that AliExpress page (${res.status}). It may be region-locked or blocking automated requests.`
    );
  }

  const html = await res.text();
  const $ = cheerio.load(html);

  const title =
    $('meta[property="og:title"]').attr("content")?.trim() ||
    $("title").text().trim();

  const images = new Set<string>();
  $('meta[property="og:image"]').each((_, el) => {
    const src = $(el).attr("content");
    if (src) images.add(src.startsWith("//") ? `https:${src}` : src);
  });

  // AliExpress embeds a window.runParams / __INIT_DATA__ JSON blob with pricing.
  // We try a loose regex match since the exact variable name changes over time.
  const priceMatch = html.match(/"formatedActivityPrice"\s*:\s*"([^"]+)"/) ||
    html.match(/"formatedPrice"\s*:\s*"([^"]+)"/) ||
    html.match(/US\s?\$\s?([\d.,]+)/);
  const priceNumber = priceMatch
    ? parseFloat(priceMatch[1].replace(/[^\d.]/g, ""))
    : 0;

  if (!title) {
    throw new Error(
      "Couldn't parse this AliExpress page. AliExpress often blocks server-side requests — try a Shopify source instead, or fetch via a proxy."
    );
  }

  const variant: ProductVariant = {
    id: "default",
    title: "Default",
    price: priceNumber,
    available: true,
  };

  return {
    title,
    description:
      $('meta[property="og:description"]').attr("content")?.trim() ||
      "Imported from AliExpress. Edit this description before publishing.",
    images: Array.from(images),
    variants: [variant],
    supplierPrice: priceNumber,
    sourceUrl: rawUrl,
  };
}
