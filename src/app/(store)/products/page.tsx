"use client";

import { useQuery } from "@tanstack/react-query";
import { getPublishedProducts } from "@/lib/products-client";
import { ProductCard } from "@/components/ProductCard";
import { Loader2, PackageSearch } from "lucide-react";

export default function ProductsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["products", "published"],
    queryFn: getPublishedProducts,
  });

  return (
    <div className="container py-12">
      <h1 className="font-display text-3xl font-bold text-gray-900">Shop</h1>
      <p className="mt-1 text-gray-600">Everything currently available.</p>

      {isLoading ? (
        <div className="flex h-60 items-center justify-center text-gray-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (data || []).length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-2 rounded-lg border border-dashed border-gray-200 py-20 text-center text-gray-400">
          <PackageSearch className="h-8 w-8" />
          <p className="text-sm">No products published yet — check back soon.</p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
          {data!.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
