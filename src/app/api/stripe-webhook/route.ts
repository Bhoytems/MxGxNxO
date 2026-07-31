// POST /api/stripe-webhook
// Stripe calls this after checkout events. On checkout.session.completed we
// create the "order" document in Firestore using the Admin SDK (bypasses
// security rules, since this is a trusted server-to-server call verified by
// the Stripe signature below).
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { adminDb } from "@/lib/firebase-admin";
import { buildReceiptEmail } from "@/lib/order-email";
import Stripe from "stripe";

// Stripe needs the raw request body to verify the signature — disable
// Next's default body parsing for this route.
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature or webhook secret." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error("Stripe webhook signature verification failed:", err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      await createOrderFromSession(session);
    } catch (err) {
      console.error("Failed to create order from Stripe session:", err);
      // Return 500 so Stripe retries the webhook.
      return NextResponse.json({ error: "Order creation failed." }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}

async function createOrderFromSession(session: Stripe.Checkout.Session) {
  // Avoid duplicate orders if Stripe retries this event.
  const existing = await adminDb
    .collection("orders")
    .where("stripeSessionId", "==", session.id)
    .limit(1)
    .get();
  if (!existing.empty) return;

  const cartMeta = session.metadata?.cart ? JSON.parse(session.metadata.cart) : [];

  // Look up each product's supplier sourceUrl so the admin knows where to
  // fulfil the order from.
  const items = await Promise.all(
    cartMeta.map(async (line: any) => {
      let sourceUrl = "";
      try {
        const productSnap = await adminDb.collection("products").doc(line.productId).get();
        sourceUrl = productSnap.exists ? (productSnap.data()?.sourceUrl ?? "") : "";
      } catch {
        // If the lookup fails, still record the order — just without the link.
      }
      return {
        productId: line.productId,
        title: line.title,
        variantTitle: line.variantTitle,
        quantity: line.quantity,
        price: line.price,
        sourceUrl,
      };
    })
  );

  const shipping = (session as any).shipping_details || (session as any).customer_details;
  const customerEmail = session.customer_details?.email || "";
  const customerName = session.customer_details?.name || "";
  const total = (session.amount_total || 0) / 100;

  await adminDb.collection("orders").add({
    stripeSessionId: session.id,
    customerEmail,
    customerName,
    shippingAddress: shipping?.address
      ? {
          line1: shipping.address.line1 || "",
          line2: shipping.address.line2 || "",
          city: shipping.address.city || "",
          state: shipping.address.state || "",
          postal_code: shipping.address.postal_code || "",
          country: shipping.address.country || "",
        }
      : null,
    items,
    total,
    status: "paid",
    createdAt: Date.now(),
  });

  // Queue a receipt email. Requires the Firebase "Trigger Email" extension
  // (see README) — it watches this "mail" collection and sends via SMTP.
  // If the extension isn't installed, this doc is simply inert.
  if (customerEmail) {
    const { subject, html } = buildReceiptEmail({ customerName, items, total });
    await adminDb.collection("mail").add({
      to: [customerEmail],
      message: { subject, html },
    });
  }
}
