"use client";

// Client component so it can use React Query to fetch + cache published products.
import { useQuery } from "@tanstack/react-query";
import { getPublishedProducts } from "@/lib/products-client";
import { ProductCard } from "@/components/ProductCard";
import { Loader2, PackageSearch } from "lucide-react";

export function FeaturedProducts() {
  const { data, isLoading } = useQuery({
    queryKey: ["products", "published"],
    queryFn: getPublishedProducts,
  });

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center text-gray-400">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const products = (data || []).slice(0, 4);

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-gray-200 py-16 text-center text-gray-400">
        <PackageSearch className="h-8 w-8" />
        <p className="text-sm">No products published yet — check back soon.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
