const express = require('express');
const mongoose = require('mongoose');
const WebSocket = require('ws');
const documentRoutes = require('./routes/document');
const authRoutes = require('./routes/auth');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON bodies
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/collab-editor', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// WebSocket setup
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

// Store connected users
const users = new Map();

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('New client connected');

  ws.on('message', (message) => {
    let data;
    try {
      data = JSON.parse(message);
    } catch (err) {
      console.error('Invalid message format:', err);
      return;
    }

    const { documentId, content, user, cursorPosition } = data;
    users.set(ws, user); // Track user presence

    // Broadcast to other clients
    wss.clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ documentId, content, cursorPosition, user }));
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    users.delete(ws); // Remove user on disconnect
  });
});

// Basic route
app.get('/', (req, res) => {
  res.send('Real-time Collaborative Editor');
});

// Use document and authentication routes
app.use('/api/documents', documentRoutes);
app.use('/api/auth', authRoutes);

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});