"use client";

// Feature A: Product Importer.
// Paste a Shopify/AliExpress URL -> fetch + parse -> edit -> save as a draft.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/ImageUploader";
import { toast } from "@/hooks/use-toast";
import { createProduct } from "@/lib/products-client";
import { ImportedProductData } from "@/types";
import { formatPrice } from "@/lib/utils";
import { Loader2, Search, Save } from "lucide-react";

export default function ImportProductPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const [saving, setSaving] = useState(false);
  // Scopes any images uploaded before the product is saved to its own Storage
  // folder, so concurrent import sessions never collide.
  const [tempId] = useState(() => `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);

  const [imported, setImported] = useState<ImportedProductData | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [myPrice, setMyPrice] = useState("");
  const [images, setImages] = useState<string[]>([]);

  async function handleFetch(e: React.FormEvent) {
    e.preventDefault();
    setFetching(true);
    setImported(null);
    try {
      const res = await fetch("/api/import-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed.");

      const product: ImportedProductData = data.product;
      setImported(product);
      setTitle(product.title);
      setDescription(product.description);
      setImages(product.images);
      // Suggest a default markup so "My Price" isn't left at zero.
      setMyPrice((product.supplierPrice * 1.4).toFixed(2));
    } catch (err: any) {
      toast({ title: "Couldn't import product", description: err.message, variant: "destructive" });
    } finally {
      setFetching(false);
    }
  }

  async function handleSave() {
    if (!imported) return;
    const price = parseFloat(myPrice);
    if (!title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    if (isNaN(price) || price <= 0) {
      toast({ title: "Enter a valid price", variant: "destructive" });
      return;
    }
    if (images.length === 0) {
      toast({ title: "Add at least one image", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const id = await createProduct({ ...imported, title, description, myPrice: price, images });
      toast({ title: "Saved as draft", description: title, variant: "success" });
      router.push("/dashboard/products");
    } catch (err: any) {
      toast({ title: "Couldn't save product", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-bold text-gray-900">Import a product</h1>
      <p className="mt-1 text-gray-600">Paste a Shopify or AliExpress product URL to pull in its data.</p>

      <Card className="mt-6">
        <CardContent className="p-6">
          <form onSubmit={handleFetch} className="flex gap-3">
            <Input
              placeholder="https://store.myshopify.com/products/example"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
            <Button type="submit" disabled={fetching}>
              {fetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Fetch
            </Button>
          </form>
        </CardContent>
      </Card>

      {imported && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Review before saving</CardTitle>
            <CardDescription>
              Supplier price: <span className="font-semibold text-gray-700">{formatPrice(imported.supplierPrice)}</span>
              {" · "}{imported.variants.length} variant{imported.variants.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <Label>Images</Label>
              <ImageUploader images={images} onChange={setImages} productId={tempId} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={6} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <div className="max-w-xs space-y-1.5">
              <Label htmlFor="myPrice">My price (USD)</Label>
              <Input
                id="myPrice"
                type="number"
                step="0.01"
                min="0"
                value={myPrice}
                onChange={(e) => setMyPrice(e.target.value)}
              />
            </div>

            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save to database
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
