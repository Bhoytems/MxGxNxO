// POST /api/paystack-webhook
// Paystack calls this on transaction events. On a successful charge, we
// create the "order" row in Supabase using the service role key (bypasses
// RLS — this is a trusted server-to-server call verified by the HMAC
// signature check below).
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");
  const secret = process.env.PAYSTACK_SECRET_KEY;

  if (!signature || !secret) {
    return NextResponse.json({ error: "Missing signature or secret key." }, { status: 400 });
  }

  // Paystack signs the raw body with your secret key (HMAC SHA512) —
  // recompute it and compare rather than trusting the payload as-is.
  const expected = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
  if (expected !== signature) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const event = JSON.parse(rawBody);

  if (event.event === "charge.success") {
    try {
      await createOrderFromCharge(event.data);
    } catch (err) {
      console.error("Failed to create order from Paystack charge:", err);
      // Return 500 so Paystack retries the webhook.
      return NextResponse.json({ error: "Order creation failed." }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}

async function createOrderFromCharge(data: any) {
  const reference: string = data.reference;

  // Avoid duplicate orders if Paystack retries this event.
  const { data: existing } = await supabaseAdmin
    .from("orders")
    .select("id")
    .eq("paystack_reference", reference)
    .maybeSingle();
  if (existing) return;

  const cartMeta: any[] = data.metadata?.cart || [];

  // Look up each product's supplier source_url so the admin knows where to
  // fulfil the order from.
  const items = await Promise.all(
    cartMeta.map(async (line) => {
      let sourceUrl = "";
      try {
        const { data: product } = await supabaseAdmin
          .from("products")
          .select("source_url")
          .eq("id", line.productId)
          .maybeSingle();
        sourceUrl = product?.source_url || "";
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

  const { error } = await supabaseAdmin.from("orders").insert({
    paystack_reference: reference,
    customer_email: data.customer?.email || "",
    customer_name: [data.customer?.first_name, data.customer?.last_name].filter(Boolean).join(" "),
    shipping_address: data.metadata?.shipping || null,
    items,
    total: (data.amount || 0) / 100, // Paystack sends kobo/cents — convert back
    status: "paid",
  });
  if (error) throw error;
}
