// Client-side Firestore reads for "orders". Rules restrict reads to the admin;
// orders are only ever written by the Stripe webhook via the Admin SDK.
import { collection, getDocs, doc, updateDoc, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Order, OrderStatus } from "@/types";

const ordersRef = collection(db, "orders");

export async function getOrders(): Promise<Order[]> {
  const q = query(ordersRef, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
}

export async function setOrderStatus(id: string, status: OrderStatus) {
  await updateDoc(doc(db, "orders", id), { status });
}
