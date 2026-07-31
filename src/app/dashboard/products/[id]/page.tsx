"use client";

// Edit an already-imported product: title, description, price, images, and
// publish status — everything the importer lets you set at import time, plus
// full image management (add your own photos, remove any image) afterward.
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getProductById, updateProduct, setProductStatus } from "@/lib/products-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ImageUploader } from "@/components/ImageUploader";
import { toast } from "@/hooks/use-toast";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id),
    enabled: !!id,
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [myPrice, setMyPrice] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);

  // Seed local form state once the product loads.
  useEffect(() => {
    if (product) {
      setTitle(product.title);
      setDescription(product.description);
      setMyPrice(String(product.myPrice));
      setImages(product.images);
      setPublished(product.status === "published");
    }
  }, [product]);

  async function handleSave() {
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
      await updateProduct(id, { title, description, myPrice: price, images });
      await setProductStatus(id, published ? "published" : "draft");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", id] });
      toast({ title: "Saved", variant: "success" });
      router.push("/dashboard/products");
    } catch (err: any) {
      toast({ title: "Couldn't save changes", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-60 items-center justify-center text-gray-400">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return <p className="text-gray-500">Product not found.</p>;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/dashboard/products" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back to products
      </Link>
      <h1 className="font-display text-2xl font-bold text-gray-900">Edit product</h1>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1.5">
            <Label>Images</Label>
            <ImageUploader images={images} onChange={setImages} productId={id} />
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

          <div className="flex items-center gap-3">
            <Switch checked={published} onCheckedChange={setPublished} />
            <Label className="cursor-pointer" onClick={() => setPublished((p) => !p)}>
              {published ? "Published" : "Draft"}
            </Label>
          </div>

          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
