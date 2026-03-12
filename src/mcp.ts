import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { OPA_Plugin } from "./index.js";
import { closeSandbox } from "./sandbox.js";

const server = new Server(
    {
        name: "opencode-opa-plugin",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {}
        }
    }
);

// Publish all OPA tools to the MCP protocol
server.setRequestHandler(ListToolsRequestSchema, async () => {
    const mcpTools = Object.entries(OPA_Plugin.tools).map(([name, config]) => {
        return {
            name: name,
            description: config.description,
            inputSchema: {
                type: "object",
                properties: {
                    // Mapping standard string inputs for the wrapper
                    target: { type: "string" },
                    args: { type: "string" },
                    query: { type: "string" },
                }
            }
        };
    });

    return {
        tools: mcpTools
    };
});

// Handle Execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    
    if (!OPA_Plugin.tools[name as keyof typeof OPA_Plugin.tools]) {
        throw new Error(`Tool not found: ${name}`);
    }

    const tool = OPA_Plugin.tools[name as keyof typeof OPA_Plugin.tools];
    
    try {
        // Minimal dynamic dispatch. In reality, strict schema parsing per-tool would be here.
        let result = "";
        const target = args?.target as string || args?.query as string || "";
        const extArg = args?.args as string || "";
        
        // Use type assertion since we are dispatching dynamically
        const executeFn = tool.execute as any;
        result = await executeFn(target, extArg);
        
        return {
            content: [{ type: "text", text: result }],
            isError: false,
        };
    } catch (e: any) {
        return {
            content: [{ type: "text", text: `Error: ${e.message}` }],
            isError: true,
        };
    }
});

// Start the MCP Stdio Server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("OPA MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Server error:", error);
    closeSandbox().finally(() => process.exit(1));
});

process.on("SIGINT", async () => {
    await closeSandbox();
    process.exit(0);
});
