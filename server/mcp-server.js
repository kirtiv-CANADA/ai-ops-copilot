const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { z } = require('zod');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Create MCP server
const server = new McpServer({
  name: 'ai-ops-copilot',
  version: '1.0.0',
});

// ---- Tool 1: parse_email ----
server.tool(
  'parse_email',
  'Extract actionable tasks from a messy client email. Returns a JSON array of tasks with title, client, deadline, and priority.',
  {
    emailText: z.string().describe('The raw email text to parse for tasks'),
  },
  async ({ emailText }) => {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash-lite' });

      const prompt = `You are an assistant that extracts tasks from client emails.

Return ONLY valid JSON, no markdown, no extra text.

Format:
{
  "tasks": [
    {
      "title": "short description of the task",
      "client": "client name or 'Unknown' if not stated",
      "deadline": "YYYY-MM-DD or 'No deadline' if not stated",
      "priority": "high" | "medium" | "low"
    }
  ]
}

Rules:
- Extract every distinct actionable task
- Use today's date (${new Date().toISOString().split('T')[0]}) as reference for relative deadlines like "Friday"
- Priority: high if urgent/short deadline, medium default, low if vague/someday

Email:
"""
${emailText}
"""`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(parsed, null, 2),
          },
        ],
      };
    } catch (err) {
      return {
        content: [
          {
            type: 'text',
            text: `Error parsing email: ${err.message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// ---- Tool 2: health_check ----
server.tool(
  'health_check',
  'Check if the AI Ops Copilot MCP server is alive and responding.',
  {},
  async () => ({
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          status: 'ok',
          server: 'ai-ops-copilot',
          time: new Date().toISOString(),
        }),
      },
    ],
  })
);

// Start the MCP server on stdio (standard transport for local MCP)
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP server running on stdio');
}

main().catch((err) => {
  console.error('MCP server failed:', err);
  process.exit(1);
});