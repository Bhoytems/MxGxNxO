// Supabase reads/writes for the "products" table.
// Writes rely on Postgres RLS policies (see supabase/schema.sql) to enforce
// that only the signed-in admin can create/update/delete.
import { supabase } from "@/lib/supabase";
import { Product, ImportedProductData } from "@/types";

// Maps a Postgres row (snake_case) to our app-level Product (camelCase).
function fromRow(row: any): Product {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    images: row.images || [],
    variants: row.variants || [],
    supplierPrice: Number(row.supplier_price),
    myPrice: Number(row.my_price),
    sourceUrl: row.source_url,
    status: row.status,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
  };
}

export async function getPublishedProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(fromRow);
}

export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(fromRow);
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? fromRow(data) : null;
}

export async function createProduct(
  data: ImportedProductData & { title: string; description: string; myPrice: number }
): Promise<string> {
  const { data: row, error } = await supabase
    .from("products")
    .insert({
      title: data.title,
      description: data.description,
      images: data.images,
      variants: data.variants,
      supplier_price: data.supplierPrice,
      my_price: data.myPrice,
      source_url: data.sourceUrl,
      status: "draft",
    })
    .select("id")
    .single();
  if (error) throw error;
  return row.id;
}

export async function setProductStatus(id: string, status: "draft" | "published") {
  const { error } = await supabase.from("products").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function updateProduct(id: string, data: Partial<Product>) {
  const patch: Record<string, any> = {};
  if (data.title !== undefined) patch.title = data.title;
  if (data.description !== undefined) patch.description = data.description;
  if (data.images !== undefined) patch.images = data.images;
  if (data.variants !== undefined) patch.variants = data.variants;
  if (data.myPrice !== undefined) patch.my_price = data.myPrice;
  if (data.status !== undefined) patch.status = data.status;

  const { error } = await supabase.from("products").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}
