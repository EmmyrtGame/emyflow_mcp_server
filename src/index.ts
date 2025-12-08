import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { startMcpServer, server } from './mcp/server';
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { clients } from './config/clients';

dotenv.config();

import webhookRoutes from './routes/webhooks';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('MCP Server is running');
});

app.use('/webhooks', webhookRoutes);

// --- MCP SSE Transport Setup ---
let transport: SSEServerTransport | null = null;

app.get('/sse', async (req, res) => {
  console.log('New SSE connection established');
  transport = new SSEServerTransport('/messages', res);
  await server.connect(transport);
});

app.post('/messages', async (req, res) => {
  if (transport) {
    await transport.handlePostMessage(req, res);
  } else {
    res.status(400).send('No active SSE connection');
  }
});
// -------------------------------

const startServer = async () => {
  try {
    await startMcpServer();
    console.log('MCP Server started');

    app.listen(PORT, () => {
      console.log(`Express server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
