import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { seedClients } from "@/lib/seed-data";

export default defineTool({
  name: "get_client",
  title: "Get client details",
  description: "Return the full caderneta ledger and details for a single client by id.",
  inputSchema: {
    client_id: z.string().describe("Client id, e.g. 'c1'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ client_id }) => {
    const client = seedClients.find((c) => c.id === client_id);
    if (!client) {
      return {
        content: [{ type: "text", text: `No client found with id '${client_id}'.` }],
        isError: true,
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(client, null, 2) }],
      structuredContent: { client },
    };
  },
});
