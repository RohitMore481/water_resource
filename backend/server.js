const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const sensorRoutes = require('./routes/sensors');
const alertRoutes = require('./routes/alerts');
const complaintRoutes = require('./routes/complaints');
const operationRoutes = require('./routes/operations');
const { startSimulator } = require('./simulation/sensorSimulator');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  },
});

// Middleware
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:3001'] }));
app.use(express.json());

// Attach io to requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sensors', sensorRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/operations', operationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// WebSocket connections
io.on('connection', (socket) => {
  console.log(`[WS] Client connected: ${socket.id}`);

  socket.on('simulate_leak', () => {
    const { triggerLeak } = require('./simulation/sensorSimulator');
    triggerLeak(io);
  });

  socket.on('simulate_contamination', () => {
    const { triggerContamination } = require('./simulation/sensorSimulator');
    triggerContamination(io);
  });

  socket.on('reset_simulation', () => {
    const { resetSimulation } = require('./simulation/sensorSimulator');
    resetSimulation(io);
  });

  socket.on('disconnect', () => {
    console.log(`[WS] Client disconnected: ${socket.id}`);
  });
});

// Start sensor simulator
startSimulator(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 JeevanRakshak Backend running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket server ready`);
  console.log(`💧 Sensor simulator active\n`);
});
