// Supabase reads for "orders". RLS restricts reads/updates to the admin;
// orders are only ever INSERTed by the Paystack webhook using the service
// role key (which bypasses RLS).
import { supabase } from "@/lib/supabase";
import { Order, OrderStatus } from "@/types";

function fromRow(row: any): Order {
  return {
    id: row.id,
    paystackReference: row.paystack_reference,
    customerEmail: row.customer_email,
    customerName: row.customer_name,
    shippingAddress: row.shipping_address,
    items: row.items || [],
    total: Number(row.total),
    status: row.status,
    createdAt: new Date(row.created_at).getTime(),
  };
}

export async function getOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(fromRow);
}

export async function setOrderStatus(id: string, status: OrderStatus) {
  const { error } = await supabase.from("orders").update({ status }).eq("id", id);
  if (error) throw error;
}
