"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { Minus, Plus, Trash2, Loader2, ShoppingBag } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);

  async function handleCheckout() {
    setCheckingOut(true);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Couldn't start checkout.");
      window.location.href = data.url;
    } catch (err: any) {
      toast({ title: "Checkout failed", description: err.message, variant: "destructive" });
      setCheckingOut(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="container flex flex-col items-center gap-3 py-24 text-center">
        <ShoppingBag className="h-10 w-10 text-gray-300" />
        <h1 className="font-display text-2xl font-bold text-gray-900">Your cart is empty</h1>
        <p className="text-gray-500">Find something you like and add it to your cart.</p>
        <Button asChild className="mt-2">
          <Link href="/products">Browse products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container grid gap-10 py-12 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <h1 className="font-display text-2xl font-bold text-gray-900">Your cart</h1>
        <div className="mt-6 divide-y divide-gray-100 rounded-lg border border-gray-100">
          {items.map((item) => (
            <div key={item.productId + item.variantId} className="flex gap-4 p-4">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-gray-50">
                <Image src={item.image} alt={item.title} fill sizes="80px" className="object-cover" />
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex justify-between gap-2">
                  <div>
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-500">{item.variantTitle}</p>
                  </div>
                  <p className="font-display font-semibold text-gray-900">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center rounded-md border border-gray-300">
                    <button
                      className="flex h-8 w-8 items-center justify-center text-gray-600 hover:bg-gray-50"
                      onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                    <button
                      className="flex h-8 w-8 items-center justify-center text-gray-600 hover:bg-gray-50"
                      onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId, item.variantId)}
                    className="text-gray-400 hover:text-red-600"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-fit rounded-lg border border-gray-200 p-6">
        <h2 className="font-display font-semibold text-gray-900">Order summary</h2>
        <div className="mt-4 flex justify-between text-sm text-gray-600">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <p className="mt-1 text-xs text-gray-400">Shipping & taxes calculated at checkout.</p>
        <Button size="lg" className="mt-6 w-full" onClick={handleCheckout} disabled={checkingOut}>
          {checkingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : "Checkout"}
        </Button>
      </div>
    </div>
  );
}
