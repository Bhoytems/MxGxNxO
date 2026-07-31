// POST /api/create-checkout-session
// Body: { items: CartLine[] }
// Creates a Stripe Checkout session priced in USD for international cards.
// We also stash the cart contents in session metadata so the webhook can
// reconstruct the order without trusting anything else from the client.
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { CartLine } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { items }: { items: CartLine[] } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const line_items = items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: `${item.title}${item.variantTitle && item.variantTitle !== "Default" ? ` — ${item.variantTitle}` : ""}`,
          images: item.image ? [item.image] : undefined,
        },
        unit_amount: Math.round(item.price * 100), // Stripe expects cents
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      shipping_address_collection: {
        // Ships internationally — allow every country Stripe supports;
        // narrow this list if you only fulfil to specific regions.
        allowed_countries: ["US", "CA", "GB", "NG", "GH", "KE", "ZA", "AU", "DE", "FR", "IE", "IN"],
      },
      customer_creation: "always",
      success_url: `${siteUrl}/checkout/success`,
      cancel_url: `${siteUrl}/cart`,
      // Cart contents, condensed, so the webhook can build the order record.
      // NOTE: Stripe metadata values are capped at 500 characters — fine for
      // small carts. For larger carts, store the cart in Firestore keyed by a
      // generated ID and pass just that ID in metadata instead.
      metadata: {
        cart: JSON.stringify(
          items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            title: i.title,
            variantTitle: i.variantTitle,
            quantity: i.quantity,
            price: i.price,
          }))
        ),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Couldn't create a checkout session." },
      { status: 500 }
    );
  }
}
