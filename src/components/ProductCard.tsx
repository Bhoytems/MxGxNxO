import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";

// Signature pricing tag used across the storefront: the supplier price is never
// shown to customers, but "myPrice" is presented with the same bold, decisive
// styling everywhere — on cards, product pages, and the cart.
export function ProductCard({ product }: { product: Product }) {
  const image = product.images[0] || "/placeholder.svg";

  return (
    <Link
      href={`/product/${product.id}`}
      className="group block overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
        <Image
          src={image}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <h3 className="line-clamp-1 font-medium text-gray-900">{product.title}</h3>
        <p className="mt-1 font-display text-lg font-bold text-primary-700">
          {formatPrice(product.myPrice)}
        </p>
      </div>
    </Link>
  );
}
