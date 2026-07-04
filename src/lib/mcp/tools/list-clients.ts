import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { seedClients } from "@/lib/seed-data";

export default defineTool({
  name: "list_clients",
  title: "List clients",
  description:
    "List all caderneta clients with their outstanding debt, number of purchases and overdue days.",
  inputSchema: {
    debtors_only: z
      .boolean()
      .optional()
      .describe("If true, only return clients with an outstanding debt."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ debtors_only }) => {
    const items = seedClients
      .filter((c) => (debtors_only ? c.debt > 0 : true))
      .map(({ ledger: _ledger, ...rest }) => rest);
    return {
      content: [{ type: "text", text: JSON.stringify(items, null, 2) }],
      structuredContent: { clients: items },
    };
  },
});
