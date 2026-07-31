"use client";

// Feature B: Products Manager — table of imported products with a
// publish/unpublish toggle.
import Image from "next/image";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllProducts, setProductStatus } from "@/lib/products-client";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { Loader2, PackagePlus, Pencil } from "lucide-react";

export default function ProductsManagerPage() {
  const queryClient = useQueryClient();
  const { data: products, isLoading } = useQuery({ queryKey: ["products", "all"], queryFn: getAllProducts });

  async function handleToggle(id: string, next: boolean) {
    try {
      await setProductStatus(id, next ? "published" : "draft");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: next ? "Published" : "Unpublished",
        variant: "success",
      });
    } catch (err: any) {
      toast({ title: "Couldn't update product", description: err.message, variant: "destructive" });
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-gray-900">Products</h1>
        <Button asChild>
          <Link href="/dashboard/import">
            <PackagePlus className="h-4 w-4" /> Import a product
          </Link>
        </Button>
      </div>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center text-gray-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (products || []).length === 0 ? (
          <p className="p-10 text-center text-sm text-gray-500">
            No products yet — import your first one.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Supplier price</TableHead>
                <TableHead>My price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Published</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products!.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="relative h-12 w-12 overflow-hidden rounded-md bg-gray-50">
                      {p.images[0] && (
                        <Image src={p.images[0]} alt="" fill sizes="48px" className="object-cover" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <Link href={`/product/${p.id}`} className="font-medium text-gray-900 hover:text-primary-600">
                      {p.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-gray-500">{formatPrice(p.supplierPrice)}</TableCell>
                  <TableCell className="font-semibold text-gray-900">{formatPrice(p.myPrice)}</TableCell>
                  <TableCell>
                    <Badge variant={p.status === "published" ? "published" : "draft"}>
                      {p.status === "published" ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={p.status === "published"}
                      onCheckedChange={(checked) => handleToggle(p.id, checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/dashboard/products/${p.id}`}>
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
