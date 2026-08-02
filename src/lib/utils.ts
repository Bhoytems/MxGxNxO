import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Standard shadcn/ui class-merging helper.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formats a number of cents (or a plain dollar float) as USD currency for display.
// The store's base currency. Paystack settles in NGN by default; if you enable
// additional settlement currencies in your Paystack dashboard, set this to
// match (e.g. "USD", "GHS", "ZAR", "KES") so displayed prices line up with
// what Paystack actually charges.
const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY || "NGN";

export function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: CURRENCY }).format(amount);
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
