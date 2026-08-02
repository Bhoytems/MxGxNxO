"use client";

// Paystack redirects here after checkout, with ?reference=xxx — whether the
// payment succeeded or not. We verify it server-side before showing a
// confirmation; the actual order record is created independently by the
// webhook, which is the source of truth.
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";

type VerifyState = "checking" | "success" | "failed";

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") || searchParams.get("trxref");
  const { clearCart } = useCart();
  const [state, setState] = useState<VerifyState>("checking");

  useEffect(() => {
    if (!reference) {
      setState("failed");
      return;
    }
    fetch(`/api/verify-transaction?reference=${encodeURIComponent(reference)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          clearCart();
          setState("success");
        } else {
          setState("failed");
        }
      })
      .catch(() => setState("failed"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference]);

  if (state === "checking") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
      </div>
    );
  }

  if (state === "failed") {
    return (
      <div className="container flex flex-col items-center gap-3 py-24 text-center">
        <XCircle className="h-12 w-12 text-red-600" />
        <h1 className="font-display text-2xl font-bold text-gray-900">Payment not completed</h1>
        <p className="max-w-sm text-gray-500">
          It looks like this payment wasn't completed. Your cart is still saved — you can try again.
        </p>
        <Button asChild className="mt-2">
          <Link href="/cart">Back to cart</Link>
        </Button>
      </div>
    );
  }

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
