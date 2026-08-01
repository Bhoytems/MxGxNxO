// Builds the HTML for an order receipt email. Kept separate from the webhook
// route so the template is easy to find and restyle.
import { OrderItem } from "@/types";

export function buildReceiptEmail(params: {
  customerName?: string;
  items: OrderItem[];
  total: number;
}) {
  const { customerName, items, total } = params;
  const rows = items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;color:#111;">
            ${item.quantity}× ${escapeHtml(item.title)}${item.variantTitle && item.variantTitle !== "Default" ? ` (${escapeHtml(item.variantTitle)})` : ""}
          </td>
          <td style="padding:8px 0;text-align:right;color:#111;">$${item.price.toFixed(2)}</td>
        </tr>`
    )
    .join("");

  const subject = "Your Magnifico order is confirmed";
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;color:#111;">
      <h1 style="color:#6D28D9;font-size:20px;">Thanks${customerName ? `, ${escapeHtml(customerName)}` : ""}!</h1>
      <p style="color:#555;font-size:14px;">Your order has been placed and is being prepared for shipping.</p>
      <table style="width:100%;border-collapse:collapse;margin-top:16px;border-top:1px solid #eee;">
        ${rows}
        <tr>
          <td style="padding-top:12px;font-weight:bold;">Total</td>
          <td style="padding-top:12px;font-weight:bold;text-align:right;">$${total.toFixed(2)}</td>
        </tr>
      </table>
      <p style="color:#999;font-size:12px;margin-top:24px;">— Magnifico</p>
    </div>`;

  return { subject, html };
}

function escapeHtml(input: string) {
  return input.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
}
