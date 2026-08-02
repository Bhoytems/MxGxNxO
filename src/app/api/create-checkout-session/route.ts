// POST /api/create-checkout-session
// Body: { items: CartLine[], email: string }
// Starts a Paystack transaction and returns its hosted payment page URL.
// Cart contents ride along in metadata so the webhook can build the order
// without trusting anything else from the client.
import { NextRequest, NextResponse } from "next/server";
import { initializeTransaction } from "@/lib/paystack";
import { CartLine } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { items, email, shippingAddress }: {
      items: CartLine[];
      email: string;
      shippingAddress: { line1: string; city: string; state: string; country: string; postal_code?: string };
    } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    }
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "Enter a valid email to check out." }, { status: 400 });
    }
    if (!shippingAddress?.line1 || !shippingAddress?.city || !shippingAddress?.country) {
      return NextResponse.json({ error: "Enter a shipping address to check out." }, { status: 400 });
    }

    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const transaction = await initializeTransaction({
      email,
      amount: total,
      callback_url: `${siteUrl}/checkout/success`,
      metadata: {
        shipping: shippingAddress,
        cart: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          title: i.title,
          variantTitle: i.variantTitle,
          quantity: i.quantity,
          price: i.price,
        })),
      },
    });

    return NextResponse.json({ url: transaction.authorization_url });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Couldn't start checkout." },
      { status: 500 }
    );
  }
}
