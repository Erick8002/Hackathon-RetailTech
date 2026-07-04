import { defineMcp } from "@lovable.dev/mcp-js";
import listProductsTool from "./tools/list-products";
import listClientsTool from "./tools/list-clients";
import getClientTool from "./tools/get-client";
import salesSummaryTool from "./tools/sales-summary";

export default defineMcp({
  name: "aesgptech-mcp",
  title: "AESGPTech Caderneta",
  version: "0.1.0",
  instructions:
    "Read-only tools for the AESGPTech digital caderneta demo. Use `sales_summary` for a quick store snapshot, `list_products` and `list_clients` to browse the catalog and customers (supports `low_stock_only` / `debtors_only` filters), and `get_client` for a full ledger of a single customer.",
  tools: [salesSummaryTool, listProductsTool, listClientsTool, getClientTool],
});
