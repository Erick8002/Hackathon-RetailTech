import { defineTool } from "@lovable.dev/mcp-js";
import { seedCashToday, seedClients, seedReceivable, seedProducts } from "@/lib/seed-data";

export default defineTool({
  name: "sales_summary",
  title: "Sales summary",
  description:
    "Return a snapshot of the store: cash in the drawer today, total receivable on the caderneta, overdue client count, and low-stock product count.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const summary = {
      cash_today_brl: seedCashToday,
      receivable_brl: seedReceivable,
      overdue_clients: seedClients.filter((c) => c.overdueDays > 0).length,
      low_stock_products: seedProducts.filter((p) => p.qty <= 5).length,
      total_clients: seedClients.length,
      total_products: seedProducts.length,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(summary, null, 2) }],
      structuredContent: summary,
    };
  },
});
