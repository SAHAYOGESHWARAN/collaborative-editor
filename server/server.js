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
  wss.on('connection', (ws) => {
    console.log('New client connected');
  
    ws.on('message', (message) => {
      let data;
      try {
        data = JSON.parse(message); // Expecting { documentId, content }
      } catch (err) {
        console.error('Invalid message format:', err);
        return;
      }
  
      // Broadcast only to clients editing the same document
      wss.clients.forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN && client.documentId === data.documentId) {
          client.send(JSON.stringify(data));
        }
      });
    });
  
    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });
  const authRoutes = require('./routes/auth');
const documentRoutes = require('./routes/document');

// Use authentication routes
app.use('/api/auth', authRoutes);

// Middleware to check JWT
const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(403).json({ message: 'Token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Protect document routes with JWT middleware
app.use('/api/documents', authenticateJWT, documentRoutes);
const users = new Map(); // Store connected users

wss.on('connection', (ws) => {
  console.log('New client connected');

  ws.on('message', (message) => {
    let data;
    try {
      data = JSON.parse(message); // Expecting { documentId, content, user }
    } catch (err) {
      console.error('Invalid message format:', err);
      return;
    }

    // Track user presence
    const { documentId, content, user } = data;
    users.set(ws, user); // Add the user to the map

    // Broadcast presence to all clients
    const usersList = Array.from(users.values());
    wss.clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'users', users: usersList }));
        if (client.documentId === documentId) {
          client.send(JSON.stringify({ documentId, content }));
        }
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    users.delete(ws); // Remove user on disconnect
    const usersList = Array.from(users.values());

    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'users', users: usersList }));
      }
    });
  });
});
wss.on('connection', (ws) => {
    console.log('New client connected');
  
    // Notify all clients about the new user
    const welcomeMessage = `${users.get(ws)} has joined the document.`;
    broadcastMessage({ type: 'notification', message: welcomeMessage });
  
    ws.on('message', (message) => {
      let data;
      try {
        data = JSON.parse(message);
      } catch (err) {
        console.error('Invalid message format:', err);
        return;
      }
  
      // Track user presence
      const { documentId, content, user, cursorPosition } = data;
      users.set(ws, user); // Add user to the map
  
      // Broadcast presence and content
      const usersList = Array.from(users.values());
      broadcastMessage({ type: 'users', users: usersList });
      wss.clients.forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN && client.documentId === documentId) {
          client.send(JSON.stringify({ documentId, content, cursorPosition }));
        }
      });
    });
  
    ws.on('close', () => {
      console.log('Client disconnected');
      const disconnectedUser = users.get(ws);
      users.delete(ws); // Remove user on disconnect
      const usersList = Array.from(users.values());
  
      // Notify all clients about the user leaving
      const farewellMessage = `${disconnectedUser} has left the document.`;
      broadcastMessage({ type: 'notification', message: farewellMessage });
  
      broadcastMessage({ type: 'users', users: usersList });
    });
  });
  
  // Helper function to broadcast messages to all clients
  function broadcastMessage(message) {
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
  wss.on('message', (message) => {
    let data;
    try {
      data = JSON.parse(message);
    } catch (err) {
      console.error('Invalid message format:', err);
      return;
    }
  
    const { documentId, content, user, cursorPosition } = data;
  
    // Broadcast content and cursor position
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN && client.documentId === documentId) {
        client.send(JSON.stringify({ documentId, content, cursorPosition, user }));
      }
    });
  });
  wss.on('message', (message) => {
    let data;
    try {
      data = JSON.parse(message);
    } catch (err) {
      console.error('Invalid message format:', err);
      return;
    }
  
    const { documentId, content, user, cursorPosition } = data;
  
    // Broadcast content and cursor position to all clients
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN && client.documentId === documentId) {
        client.send(JSON.stringify({
          documentId,
          content,
          cursorPosition,
          user,
        }));
      }
    });
  });
  