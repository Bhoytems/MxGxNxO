"use client";

// Orders table populated from Firestore, which is populated by the Stripe
// webhook. Lets the admin see the supplier link for each item and mark
// orders "fulfilled" once shipped from the supplier.
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getOrders, setOrderStatus } from "@/lib/orders-client";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { Loader2, ExternalLink } from "lucide-react";

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const { data: orders, isLoading } = useQuery({ queryKey: ["orders"], queryFn: getOrders });

  async function markFulfilled(id: string) {
    try {
      await setOrderStatus(id, "fulfilled");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({ title: "Marked as fulfilled", variant: "success" });
    } catch (err: any) {
      toast({ title: "Couldn't update order", description: err.message, variant: "destructive" });
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-gray-900">Orders</h1>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center text-gray-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (orders || []).length === 0 ? (
          <p className="p-10 text-center text-sm text-gray-500">
            No orders yet — they'll appear here as soon as a customer checks out.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders!.map((o) => (
                <TableRow key={o.id}>
                  <TableCell>
                    <p className="font-medium text-gray-900">{o.customerName || "—"}</p>
                    <p className="text-xs text-gray-500">{o.customerEmail}</p>
                  </TableCell>
                  <TableCell className="max-w-sm">
                    <ul className="space-y-1">
                      {o.items.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <span className="text-gray-700">
                            {item.quantity}× {item.title}
                            {item.variantTitle && item.variantTitle !== "Default" ? ` (${item.variantTitle})` : ""}
                          </span>
                          {item.sourceUrl && (
                            <a
                              href={item.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-400 hover:text-primary-600"
                              title="Open supplier link"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  </TableCell>
                  <TableCell className="font-semibold text-gray-900">{formatPrice(o.total)}</TableCell>
                  <TableCell>
                    <Badge variant={o.status === "fulfilled" ? "published" : "default"}>
                      {o.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {o.status !== "fulfilled" && (
                      <Button size="sm" variant="outline" onClick={() => markFulfilled(o.id)}>
                        Mark fulfilled
                      </Button>
                    )}
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
