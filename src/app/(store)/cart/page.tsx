"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/utils";
import { Minus, Plus, Trash2, Loader2, ShoppingBag } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);

  // Paystack needs an email and we handle physical shipping ourselves as
  // dropshippers, so both are collected here rather than mid-checkout.
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState({ line1: "", city: "", state: "", country: "", postal_code: "" });

  async function handleCheckout() {
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      toast({ title: "Enter a valid email", variant: "destructive" });
      return;
    }
    if (!address.line1 || !address.city || !address.country) {
      toast({ title: "Enter your shipping address", description: "Address, city, and country are required.", variant: "destructive" });
      return;
    }

    setCheckingOut(true);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, email, shippingAddress: address }),
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

        <div className="mt-8 rounded-lg border border-gray-200 p-6">
          <h2 className="font-display font-semibold text-gray-900">Shipping details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="line1">Address</Label>
              <Input id="line1" value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city">City</Label>
              <Input id="city" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="state">State / Province</Label>
              <Input id="state" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="country">Country</Label>
              <Input id="country" value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="postal">Postal code</Label>
              <Input id="postal" value={address.postal_code} onChange={(e) => setAddress({ ...address, postal_code: e.target.value })} />
            </div>
          </div>
        </div>
      </div>

      <div className="h-fit rounded-lg border border-gray-200 p-6">
        <h2 className="font-display font-semibold text-gray-900">Order summary</h2>
        <div className="mt-4 flex justify-between text-sm text-gray-600">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <p className="mt-1 text-xs text-gray-400">Shipping is included in each product's price.</p>
        <Button size="lg" className="mt-6 w-full" onClick={handleCheckout} disabled={checkingOut}>
          {checkingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : "Checkout with Paystack"}
        </Button>
      </div>
    </div>
  );
}
