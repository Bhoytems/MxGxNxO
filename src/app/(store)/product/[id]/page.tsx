"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { getProductById } from "@/lib/products-client";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { Loader2, Minus, Plus } from "lucide-react";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id),
    enabled: !!id,
  });

  const [activeImage, setActiveImage] = useState(0);
  const [variantId, setVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center text-gray-400">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-20 text-center text-gray-500">
        Product not found — it may have been unpublished.
      </div>
    );
  }

  const selectedVariant =
    product.variants.find((v) => v.id === variantId) || product.variants[0];

  function handleAddToCart() {
    if (!product) return;
    addItem({
      productId: product.id,
      variantId: selectedVariant?.id || "default",
      title: product.title,
      variantTitle: selectedVariant?.title || "Default",
      image: product.images[0] || "/placeholder.svg",
      price: product.myPrice,
      quantity,
    });
    toast({ title: "Added to cart", description: product.title, variant: "success" });
  }

  return (
    <div className="container grid gap-10 py-12 md:grid-cols-2">
      <div>
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-50">
          <Image
            src={product.images[activeImage] || "/placeholder.svg"}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        </div>
        {product.images.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {product.images.map((img, i) => (
              <button
                key={img + i}
                onClick={() => setActiveImage(i)}
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 ${
                  i === activeImage ? "border-primary-600" : "border-transparent"
                }`}
              >
                <Image src={img} alt="" fill sizes="64px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <h1 className="font-display text-3xl font-bold text-gray-900">{product.title}</h1>
        <p className="mt-3 font-display text-2xl font-bold text-primary-700">
          {formatPrice(product.myPrice)}
        </p>

        {product.variants.length > 1 && (
          <div className="mt-6">
            <p className="mb-2 text-sm font-medium text-gray-700">Options</p>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVariantId(v.id)}
                  disabled={!v.available}
                  className={`rounded-md border px-3 py-1.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40 ${
                    (selectedVariant?.id || product.variants[0].id) === v.id
                      ? "border-primary-600 bg-primary-50 text-primary-700"
                      : "border-gray-300 text-gray-700 hover:border-gray-400"
                  }`}
                >
                  {v.title}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center gap-3">
          <div className="flex items-center rounded-md border border-gray-300">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex h-10 w-10 items-center justify-center text-gray-600 hover:bg-gray-50"
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center text-sm font-medium">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="flex h-10 w-10 items-center justify-center text-gray-600 hover:bg-gray-50"
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <Button size="lg" className="flex-1" onClick={handleAddToCart}>
            Add to cart
          </Button>
        </div>

        <div className="mt-8 border-t border-gray-100 pt-6">
          <h2 className="font-display font-semibold text-gray-900">Description</h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-600">
            {product.description}
          </p>
        </div>
      </div>
    </div>
  );
}
