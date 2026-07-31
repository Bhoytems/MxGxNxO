// POST /api/import-product
// Body: { url: string }
// Fetches and normalizes product data from a Shopify or AliExpress URL.
// Runs server-side so the request isn't subject to browser CORS restrictions,
// and so we control the User-Agent sent to the supplier site.
import { NextRequest, NextResponse } from "next/server";
import { fetchShopifyProduct } from "@/lib/shopify-parser";
import { fetchAliExpressProduct, isAliExpressUrl } from "@/lib/aliexpress-parser";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Paste a product URL first." }, { status: 400 });
    }

    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return NextResponse.json({ error: "That's not a valid URL." }, { status: 400 });
    }
    if (!/^https?:$/.test(parsed.protocol)) {
      return NextResponse.json({ error: "URL must start with http:// or https://" }, { status: 400 });
    }

    const data = isAliExpressUrl(url)
      ? await fetchAliExpressProduct(url)
      : await fetchShopifyProduct(url);

    return NextResponse.json({ product: data });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Something went wrong importing that product." },
      { status: 422 }
    );
  }
}
