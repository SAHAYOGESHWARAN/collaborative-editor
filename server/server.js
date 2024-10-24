const express = require('express');
const mongoose = require('mongoose');
const WebSocket = require('ws');

// Initialize the app
const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/collab-editor', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// WebSocket setup
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('New client connected');
  
  ws.on('message', (message) => {
    console.log('Received:', message);
    
    // Broadcast to all connected clients
    wss.clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Basic route
app.get('/', (req, res) => {
  res.send('Real-time Collaborative Editor');
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const express = require('express');
const mongoose = require('mongoose');
const WebSocket = require('ws');
const documentRoutes = require('./routes/document');

// Initialize the app
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

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('New client connected');
  
  ws.on('message', (message) => {
    console.log('Received:', message);
    
    // Broadcast to all connected clients
    wss.clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Basic route
app.get('/', (req, res) => {
  res.send('Real-time Collaborative Editor');
});

// Use document routes
app.use('/api/documents', documentRoutes);

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
wss.on('connection', (ws) => {
    console.log('New client connected');
    
    ws.on('message', (message) => {
      console.log('Received:', message);
      
      // Parse the message (in case you want to handle document IDs and content)
      let data;
      try {
        data = JSON.parse(message);
      } catch (e) {
        console.error('Invalid message format:', e);
        return;
      }
  
      // Broadcast to all other clients except the sender
      wss.clients.forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    });
  
    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });
  