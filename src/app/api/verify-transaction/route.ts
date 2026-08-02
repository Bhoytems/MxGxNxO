// GET /api/verify-transaction?reference=xxx
// Called by the checkout success page to confirm a transaction actually
// succeeded before showing a confirmation (Paystack redirects here whether
// the payment succeeded or not — the webhook is still the source of truth
// for order creation, this route is just for the UI's benefit).
import { NextRequest, NextResponse } from "next/server";
import { verifyTransaction } from "@/lib/paystack";

export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get("reference");
  if (!reference) {
    return NextResponse.json({ error: "Missing reference." }, { status: 400 });
  }

  try {
    const data = await verifyTransaction(reference);
    return NextResponse.json({ status: data.status });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Couldn't verify transaction." }, { status: 500 });
  }
}
