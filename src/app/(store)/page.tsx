import Link from "next/link";
import { ArrowRight, Globe2, Tag, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeaturedProducts } from "./FeaturedProducts";

// Homepage. The hero states the store's actual value prop — sourced products,
// priced and shipped by Magnifico — then a 3-step strip makes the real pipeline
// (import → price → ship) visible, since that sequence is genuinely how a
// product gets from a supplier to the customer's door.
export default function HomePage() {
  return (
    <div>
      <section className="border-b border-gray-100 bg-white">
        <div className="container grid gap-10 py-20 md:grid-cols-2 md:items-center md:py-28">
          <div className="animate-fade-up">
            <p className="mb-4 inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-700">
              Sourced worldwide, shipped to you
            </p>
            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-gray-900 sm:text-6xl">
              Good finds,
              <br />
              one price tag.
            </h1>
            <p className="mt-6 max-w-md text-lg text-gray-600">
              Magnifico hand-picks products from suppliers around the world and gets them to your
              door — no haggling, no guessing on shipping, one checkout.
            </p>
            <div className="mt-8 flex gap-3">
              <Button size="lg" asChild>
                <Link href="/products">
                  Shop now <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="relative aspect-square w-full max-w-md justify-self-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 md:justify-self-end">
            <div className="flex h-full flex-col justify-between p-8 text-white">
              <Globe2 className="h-10 w-10 opacity-80" />
              <div>
                <p className="font-display text-2xl font-bold">Shipped internationally</p>
                <p className="mt-2 text-sm text-primary-100">
                  Every order checks out in one currency, wherever you are.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-gray-100 bg-gray-50/60">
        <div className="container grid gap-8 py-14 sm:grid-cols-3">
          <Step icon={<Globe2 className="h-5 w-5" />} n="01" title="Sourced">
            We find the product from suppliers around the world.
          </Step>
          <Step icon={<Tag className="h-5 w-5" />} n="02" title="Priced">
            One clear price — duties and markup already included.
          </Step>
          <Step icon={<Truck className="h-5 w-5" />} n="03" title="Shipped">
            It ships straight to you, tracked from order to doorstep.
          </Step>
        </div>
      </section>

      <section className="container py-16">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-display text-2xl font-bold text-gray-900">Featured</h2>
          <Link href="/products" className="text-sm font-semibold text-primary-600 hover:underline">
            View all
          </Link>
        </div>
        <FeaturedProducts />
      </section>
    </div>
  );
}

function Step({ icon, n, title, children }: { icon: React.ReactNode; n: string; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-white">{icon}</span>
        <span className="font-display text-sm font-semibold text-gray-400">{n}</span>
      </div>
      <h3 className="mt-3 font-display text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-600">{children}</p>
    </div>
  );
}
