// Shared domain types for Magnifico.

export type ProductStatus = "draft" | "published";

export interface ProductVariant {
  id: string;
  title: string;       // e.g. "Small / Red"
  price: number;        // supplier price for this variant, in USD
  sku?: string;
  available: boolean;
}

export interface Product {
  id: string;
  title: string;
  description: string;      // plain-text/HTML description shown on the product page
  images: string[];         // image URLs
  variants: ProductVariant[];
  supplierPrice: number;     // base supplier price pulled from the source
  myPrice: number;           // the price the admin sets — what customers actually pay
  sourceUrl: string;         // original Shopify/AliExpress product URL, kept for fulfilment
  status: ProductStatus;
  createdAt: number;         // epoch ms
  updatedAt: number;
}

export interface CartLine {
  productId: string;
  variantId: string;
  title: string;
  variantTitle: string;
  image: string;
  price: number;              // myPrice at time of adding to cart
  quantity: number;
}

export type OrderStatus = "paid" | "fulfilled";

export interface OrderItem {
  productId: string;
  title: string;
  variantTitle: string;
  quantity: number;
  price: number;
  sourceUrl: string; // supplier link, so the admin knows where to fulfil from
}

export interface Order {
  id: string;
  paystackReference: string;
  customerEmail: string;
  customerName?: string;
  shippingAddress?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  items: OrderItem[];
  total: number; // in the store's base currency (see NEXT_PUBLIC_CURRENCY)
  status: OrderStatus;
  createdAt: number;
}

// Shape returned by the /api/import-product route after parsing a Shopify .json feed.
export interface ImportedProductData {
  title: string;
  description: string;
  images: string[];
  variants: ProductVariant[];
  supplierPrice: number;
  sourceUrl: string;
}
