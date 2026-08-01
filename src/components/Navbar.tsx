"use client";

// Public storefront navigation. Shows cart count and a subtle "Dashboard" link
// only when the signed-in user is the admin.
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

export function Navbar() {
  const { count } = useCart();
  const { isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="font-display text-xl font-bold tracking-tight text-gray-900">
          Magnif<span className="text-primary-600">ico</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-gray-600 md:flex">
          <Link href="/" className="hover:text-gray-900">Home</Link>
          <Link href="/products" className="hover:text-gray-900">Shop</Link>
          {isAdmin && (
            <Link href="/dashboard" className="hover:text-gray-900">Dashboard</Link>
          )}
        </nav>
        <Link
          href="/cart"
          className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100"
          aria-label="View cart"
        >
          <ShoppingBag className="h-5 w-5 text-gray-800" />
          {count > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-[11px] font-bold text-white">
              {count}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
