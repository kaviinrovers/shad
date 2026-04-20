const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Initialize Firebase Admin
try {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
} catch (error) {
  console.log('Firebase already initialized or running without credentials');
}

// Call storage (in-memory, replace with database in production)
const callRecords = new Map();
const userProfiles = new Map();

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Shadhee Backend Server is running', 
    status: 'online',
    connectedUsers: Array.from(userConnections.keys())
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    uptime: process.uptime(),
    connectedUsers: userConnections.size
  });
});

app.get('/users/:userId', (req, res) => {
  const { userId } = req.params;
  const socketId = userConnections.get(userId);
  res.json({
    userId,
    socketId,
    online: socketId ? true : false
  });
});

// Auth middleware
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Protected route example
app.get('/protected', verifyToken, (req, res) => {
  res.json({ message: 'Access granted', user: req.user });
});

// ============= CALL API ENDPOINTS =============

// Initiate a call
app.post('/calls/initiate', verifyToken, (req, res) => {
  const { to } = req.body;
  const from = req.user.uid;
  const callId = `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  if (!to) {
    return res.status(400).json({ error: 'Recipient ID required' });
  }

  const callData = {
    id: callId,
    from,
    to,
    status: 'pending',
    startTime: Date.now(),
  };

  callRecords.set(callId, callData);

  res.json({ 
    success: true,
    data: callData 
  });
  console.log(`Call initiated: ${from} -> ${to} (ID: ${callId})`);
});

// Accept call
app.post('/calls/:callId/accept', verifyToken, (req, res) => {
  const { callId } = req.params;
  const userId = req.user.uid;
  const callData = callRecords.get(callId);

  if (!callData) {
    return res.status(404).json({ error: 'Call not found' });
  }

  if (callData.to !== userId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  callData.status = 'accepted';
  callData.acceptedAt = Date.now();

  res.json({ success: true, data: callData });
  console.log(`Call accepted: ${callId}`);
});

// Reject call
app.post('/calls/:callId/reject', verifyToken, (req, res) => {
  const { callId } = req.params;
  const userId = req.user.uid;
  const callData = callRecords.get(callId);

  if (!callData) {
    return res.status(404).json({ error: 'Call not found' });
  }

  if (callData.to !== userId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  callData.status = 'rejected';
  callData.rejectedAt = Date.now();

  res.json({ success: true, data: callData });
  console.log(`Call rejected: ${callId}`);
});

// End call
app.post('/calls/:callId/end', verifyToken, (req, res) => {
  const { callId } = req.params;
  const callData = callRecords.get(callId);

  if (!callData) {
    return res.status(404).json({ error: 'Call not found' });
  }

  callData.status = 'ended';
  callData.endTime = Date.now();
  if (callData.startTime) {
    callData.duration = Math.floor((callData.endTime - callData.startTime) / 1000); // Duration in seconds
  }

  res.json({ success: true, data: callData });
  console.log(`Call ended: ${callId} (Duration: ${callData.duration}s)`);
});

// Get call history
app.get('/calls/history', verifyToken, (req, res) => {
  const userId = req.user.uid;
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;

  const userCalls = Array.from(callRecords.values())
    .filter(call => call.from === userId || call.to === userId)
    .sort((a, b) => (b.startTime || 0) - (a.startTime || 0))
    .slice(offset, offset + limit);

  res.json({ 
    success: true,
    data: userCalls,
    total: userCalls.length
  });
});

// Get pending calls
app.get('/calls/pending', verifyToken, (req, res) => {
  const userId = req.user.uid;
  const pendingCalls = Array.from(callRecords.values()).filter(
    call => call.to === userId && call.status === 'pending'
  );

  res.json({ 
    success: true,
    data: pendingCalls 
  });
});

// Get ongoing calls
app.get('/calls/ongoing', verifyToken, (req, res) => {
  const userId = req.user.uid;
  const ongoingCalls = Array.from(callRecords.values()).filter(
    call => (call.from === userId || call.to === userId) && 
            call.status === 'accepted' &&
            !call.endTime
  );

  res.json({ 
    success: true,
    data: ongoingCalls 
  });
});

// Get call details
app.get('/calls/:callId', verifyToken, (req, res) => {
  const { callId } = req.params;
  const callData = callRecords.get(callId);

  if (!callData) {
    return res.status(404).json({ error: 'Call not found' });
  }

  res.json({ success: true, data: callData });
});

// Socket.io connection handling
const userConnections = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (userId) => {
    userConnections.set(userId, socket.id);
    socket.join(userId);
    console.log(`User ${userId} joined with socket ${socket.id}`);
    socket.emit('connected', { message: 'Successfully connected to server' });
  });

  socket.on('sendMessage', (data) => {
    if (!data.from || !data.to) {
      console.error('Message missing from or to:', data);
      return;
    }
    
    console.log('Message from', data.from, 'to', data.to, '- Encrypted:', data.text.substring(0, 20) + '...');
    
    // Send to recipient directly using their socket room
    io.to(data.to).emit('receiveMessage', {
      id: `msg-${Date.now()}-${Math.random()}`,
      from: data.from,
      to: data.to,
      text: data.text,
      timestamp: data.timestamp || Date.now(),
      read: false,
      type: data.type || 'text',
    });
    
    console.log(`Message delivered to room: ${data.to}`);
  });

  socket.on('typing', (data) => {
    console.log(`${data.from} is typing to ${data.to}`);
    io.to(data.to).emit('typing', data.from);
  });

  socket.on('stopTyping', (data) => {
    console.log(`${data.from} stopped typing to ${data.to}`);
    io.to(data.to).emit('stopTyping', data.from);
  });

  // Video Call Events
  socket.on('startCall', (data) => {
    console.log('Call started from', data.from, 'to', data.to);
    io.to(data.to).emit('incomingCall', data.from);
  });

  socket.on('acceptCall', (data) => {
    console.log('Call accepted by', data.from);
    io.to(data.to).emit('callAccepted', data.from);
  });

  socket.on('rejectCall', (data) => {
    console.log('Call rejected by', data.from);
    io.to(data.to).emit('callRejected', data.from);
  });

  socket.on('endCall', (data) => {
    console.log('Call ended by', data.from);
    io.to(data.to).emit('callEnded', data.from);
  });

  socket.on('callSignal', (signal) => {
    console.log('Call signal from', signal.from, 'to', signal.to, 'type:', signal.type);
    io.to(signal.to).emit('callSignal', signal);
  });

  // Voice Message Events
  socket.on('sendVoiceMessage', (data) => {
    console.log('Voice message from', data.from, 'to', data.to, '- Duration:', data.duration);

    io.to(data.to).emit('voiceMessage', {
      id: `voice-${Date.now()}-${Math.random()}`,
      from: data.from,
      to: data.to,
      audio: data.audio,
      timestamp: data.timestamp || Date.now(),
      duration: data.duration,
      type: 'voice',
    });

    console.log('Voice message delivered to', data.to);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    for (const [userId, socketId] of userConnections.entries()) {
      if (socketId === socket.id) {
        userConnections.delete(userId);
        console.log(`User ${userId} removed from connections`);
        break;
      }
    }
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`\n🚀 Shadhee Backend Server running on port ${PORT}`);
  console.log(`📡 Socket.io ready for connections on ws://localhost:${PORT}`);
  console.log(`🔗 API: http://localhost:${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health\n`);
});