// Client-side Firestore reads/writes for the "products" collection.
// Writes here rely on Firestore security rules (request.auth.token.email === admin)
// to enforce that only the signed-in admin can create/update/delete.
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product, ImportedProductData } from "@/types";

const productsRef = collection(db, "products");

export async function getPublishedProducts(): Promise<Product[]> {
  const q = query(productsRef, where("status", "==", "published"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
}

export async function getAllProducts(): Promise<Product[]> {
  const q = query(productsRef, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
}

export async function getProductById(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(db, "products", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Product;
}

export async function createProduct(
  data: ImportedProductData & { title: string; description: string; myPrice: number }
): Promise<string> {
  const now = Date.now();
  const ref = await addDoc(productsRef, {
    title: data.title,
    description: data.description,
    images: data.images,
    variants: data.variants,
    supplierPrice: data.supplierPrice,
    myPrice: data.myPrice,
    sourceUrl: data.sourceUrl,
    status: "draft",
    createdAt: now,
    updatedAt: now,
  });
  return ref.id;
}

export async function setProductStatus(id: string, status: "draft" | "published") {
  await updateDoc(doc(db, "products", id), { status, updatedAt: Date.now() });
}

export async function updateProduct(id: string, data: Partial<Product>) {
  await updateDoc(doc(db, "products", id), { ...data, updatedAt: Date.now() });
}

export async function deleteProduct(id: string) {
  await deleteDoc(doc(db, "products", id));
}
