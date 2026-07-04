import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { seedProducts } from "@/lib/seed-data";

export default defineTool({
  name: "list_products",
  title: "List products",
  description:
    "List the demo catalog of products in the AESGPTech caderneta, with price and current stock quantity.",
  inputSchema: {
    low_stock_only: z
      .boolean()
      .optional()
      .describe("If true, only return products with stock <= 5 units."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ low_stock_only }) => {
    const items = low_stock_only ? seedProducts.filter((p) => p.qty <= 5) : seedProducts;
    return {
      content: [{ type: "text", text: JSON.stringify(items, null, 2) }],
      structuredContent: { products: items },
    };
  },
});
