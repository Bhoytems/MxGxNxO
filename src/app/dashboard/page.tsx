"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getAllProducts } from "@/lib/products-client";
import { getOrders } from "@/lib/orders-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { PackagePlus } from "lucide-react";

export default function DashboardOverviewPage() {
  const { data: products } = useQuery({ queryKey: ["products", "all"], queryFn: getAllProducts });
  const { data: orders } = useQuery({ queryKey: ["orders"], queryFn: getOrders });

  const published = (products || []).filter((p) => p.status === "published").length;
  const draft = (products || []).filter((p) => p.status === "draft").length;
  const revenue = (orders || []).reduce((sum, o) => sum + o.total, 0);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-gray-900">Overview</h1>
        <Button asChild>
          <Link href="/dashboard/import">
            <PackagePlus className="h-4 w-4" /> Import a product
          </Link>
        </Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Published products" value={String(published)} />
        <Stat label="Drafts" value={String(draft)} />
        <Stat label="Total revenue" value={formatPrice(revenue)} />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Recent orders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(orders || []).length === 0 && <p className="text-sm text-gray-500">No orders yet.</p>}
          {(orders || []).slice(0, 5).map((o) => (
            <div key={o.id} className="flex items-center justify-between text-sm">
              <span className="text-gray-700">{o.customerEmail}</span>
              <span className="font-medium text-gray-900">{formatPrice(o.total)}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="mt-1 font-display text-2xl font-bold text-gray-900">{value}</p>
      </CardContent>
    </Card>
  );
}
