"use client";

// Stripe redirects here after a successful Checkout session.
// The order itself is created server-side by the webhook (source of truth),
// this page just clears the local cart and shows a confirmation.
import { useEffect } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";

export default function CheckoutSuccessPage() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container flex flex-col items-center gap-3 py-24 text-center">
      <CheckCircle2 className="h-12 w-12 text-green-600" />
      <h1 className="font-display text-2xl font-bold text-gray-900">Order placed</h1>
      <p className="max-w-sm text-gray-500">
        Thanks for your order — a confirmation has been sent to your email. We'll notify you once it ships.
      </p>
      <Button asChild className="mt-2">
        <Link href="/products">Continue shopping</Link>
      </Button>
    </div>
  );
}
