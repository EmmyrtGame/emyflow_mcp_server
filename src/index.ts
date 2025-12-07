import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { startMcpServer } from './mcp/server';
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
