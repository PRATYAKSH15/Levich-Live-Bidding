import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import connectDB from './config/db.js';
import itemRoutes from './routes/itemRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import initializeSocket from './socket/socketHandler.js';

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.use('/api', itemRoutes);

app.get('/', (req, res) => {
  res.json({
    name: 'Live Bidding Platform API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: 'GET /api/health',
      time: 'GET /api/time',
      items: 'GET /api/items',
      item: 'GET /api/items/:id',
      bids: 'GET /api/items/:id/bids'
    }
  });
});

app.use(errorHandler);

initializeSocket(io);

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`
🚀 Server running on port ${PORT}
📡 Socket.IO ready
🌍 Environment: ${process.env.NODE_ENV || 'development'}
      `);
    });
  } catch (error) {
    console.error('Failed to start:', error);
    process.exit(1);
  }
};

start();

process.on('SIGTERM', () => {
  console.log('Shutting down...');
  server.close(() => process.exit(0));
});