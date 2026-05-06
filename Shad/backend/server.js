const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const crypto = require('crypto');
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

// Request Logger Middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Serve static files from the React app
const distPath = path.join(__dirname, '../web/dist');
app.use(express.static(distPath));

// Initialize Supabase Client
let supabase;
let supabaseEnabled = false;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey);
  supabaseEnabled = true;
  console.log('✅ Supabase initialized');
} else {
  console.log('⚠️ Running without Supabase credentials. Using mock authentication and in-memory storage.');
}

// In-memory storage fallback (used only if Supabase is disabled)
const callRecordsMock = new Map();
const userProfilesMock = new Map();
const messagesMock = [];
const userConnections = new Map();

// Helper to generate a simple token for mock auth
const generateToken = (userId) => {
  return `token-${userId}-${crypto.randomBytes(8).toString('hex')}`;
};

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    uptime: process.uptime(),
    connectedUsers: userConnections.size,
    database: supabaseEnabled ? 'supabase' : 'mock'
  });
});

// ============= AUTH API ENDPOINTS =============

// Signup
app.post('/api/auth/signup', async (req, res) => {
  const { email, password, displayName } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password required' });
  }

  try {
    let userId;
    let token;

    if (supabaseEnabled) {
      // 1. Create User in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { display_name: displayName }
      });

      if (authError) throw authError;
      userId = authData.user.id;

      // 2. Create Profile in 'profiles' table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email,
          display_name: displayName || email.split('@')[0],
          nickname: displayName || email.split('@')[0]
        });

      if (profileError) console.error('Error creating profile:', profileError);
      
      // Generate a mock token for frontend consistency
      token = generateToken(userId);
    } else {
      userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const profile = {
        uid: userId,
        email,
        displayName: displayName || email.split('@')[0],
        nickname: displayName || email.split('@')[0],
        createdAt: new Date().toISOString(),
      };
      userProfilesMock.set(userId, profile);
      token = generateToken(userId);
    }

    res.json({
      success: true,
      data: { token, userId, email, displayName }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    let userId;
    let displayName;
    let token;

    if (supabaseEnabled) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      userId = data.user.id;
      displayName = data.user.user_metadata?.display_name || email.split('@')[0];
      token = generateToken(userId);
    } else {
      const user = Array.from(userProfilesMock.values()).find(u => u.email === email);
      if (!user) return res.status(401).json({ success: false, error: 'User not found.' });
      
      userId = user.uid;
      displayName = user.displayName;
      token = generateToken(userId);
    }

    res.json({
      success: true,
      data: { token, userId, email, displayName }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ success: false, error: error.message });
  }
});

// Get Profile
app.get('/api/auth/profile', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ success: false, error: 'No token' });
  
  const token = authHeader.split(' ')[1];
  const userId = token.split('-')[1];
  
  try {
    let profile;
    if (supabaseEnabled) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      profile = { ...data, uid: data.id }; // Map 'id' to 'uid' for frontend
    } else {
      profile = userProfilesMock.get(userId);
    }

    if (!profile) return res.status(404).json({ success: false, error: 'Profile not found' });
    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============= USERS API ENDPOINTS =============

// Get User by ID
app.get('/api/users/:userId', async (req, res) => {
  const { userId } = req.params;
  const socketId = userConnections.get(userId);

  try {
    let profile;
    if (supabaseEnabled) {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      profile = data ? { ...data, uid: data.id } : null;
    } else {
      profile = userProfilesMock.get(userId);
    }
    
    res.json({
      success: true,
      data: {
        ...(profile || { uid: userId }),
        online: !!socketId
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Search Users
app.get('/api/users/search', async (req, res) => {
  const { q } = req.query;
  
  try {
    let results;
    if (supabaseEnabled) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .or(`email.ilike.%${q}%,display_name.ilike.%${q}%`);
      results = data.map(u => ({ ...u, uid: u.id }));
    } else {
      results = Array.from(userProfilesMock.values()).filter(u => 
        u.email.includes(q) || u.displayName.toLowerCase().includes(q.toLowerCase())
      );
    }
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Connect Partner
app.post('/api/users/connect', async (req, res) => {
  const { partnerEmail } = req.body;
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];
  const userId = token?.split('-')[1];

  try {
    if (supabaseEnabled) {
      // Find partner
      const { data: partner } = await supabase.from('profiles').select('id').eq('email', partnerEmail).single();
      if (!partner) return res.status(404).json({ success: false, error: 'Partner not found' });

      // Update both profiles
      await supabase.from('profiles').update({ partner_id: partner.id }).eq('id', userId);
      await supabase.from('profiles').update({ partner_id: userId }).eq('id', partner.id);
    } else {
      const profile = userProfilesMock.get(userId);
      const partner = Array.from(userProfilesMock.values()).find(u => u.email === partnerEmail);

      if (!profile || !partner) return res.status(404).json({ success: false, error: 'Profile or Partner not found' });

      profile.partner = partner.uid;
      partner.partner = profile.uid;
    }

    res.json({ success: true, message: 'Connected to partner!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============= CALL API ENDPOINTS =============

const verifyTokenSimple = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ success: false, error: 'No token' });
  
  const token = authHeader.split(' ')[1];
  const userId = token.split('-')[1];
  
  req.user = { uid: userId };
  next();
};

app.post('/api/calls/initiate', async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];
  const from = token?.split('-')[1];
  const { to } = req.body;

  try {
    if (supabaseEnabled) {
      const { data, error } = await supabase
        .from('calls')
        .insert({ from_id: from, to_id: to, status: 'pending' })
        .select()
        .single();
      if (error) throw error;
      res.json({ success: true, data });
    } else {
      const callId = `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const callData = { id: callId, from, to, status: 'pending', startTime: Date.now() };
      callRecordsMock.set(callId, callData);
      res.json({ success: true, data: callData });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============= CHAT API ENDPOINTS =============

app.get('/api/chat/messages/:userId', verifyTokenSimple, async (req, res) => {
  const myId = req.user.uid;
  const partnerId = req.params.userId;
  
  try {
    let history;
    if (supabaseEnabled) {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`and(from_id.eq.${myId},to_id.eq.${partnerId}),and(from_id.eq.${partnerId},to_id.eq.${myId})`)
        .order('created_at', { ascending: true });
      history = data.map(m => ({
        ...m,
        from: m.from_id,
        to: m.to_id,
        text: m.content,
        timestamp: new Date(m.created_at).getTime()
      }));
    } else {
      history = messagesMock.filter(m => 
        (m.from === myId && m.to === partnerId) || 
        (m.from === partnerId && m.to === myId)
      );
    }
    
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    userConnections.set(userId, socket.id);
    socket.join(userId);
    socket.emit('connected', { message: 'Successfully connected to server' });
  });

  socket.on('sendMessage', async (data) => {
    const messageObj = {
      from: data.from,
      to: data.to,
      text: data.text,
      timestamp: Date.now(),
      read: false,
      type: data.type || 'text',
    };

    if (supabaseEnabled) {
      const { error } = await supabase
        .from('messages')
        .insert({
          from_id: data.from,
          to_id: data.to,
          content: data.text,
          type: data.type || 'text'
        });
      if (error) console.error('Error saving message to Supabase:', error);
    } else {
      messagesMock.push({ ...messageObj, id: `msg-${Date.now()}-${Math.random()}` });
    }
    
    io.to(data.to).emit('receiveMessage', messageObj);
  });
  
  socket.on('typing', (data) => io.to(data.to).emit('typing', data.from));
  socket.on('stopTyping', (data) => io.to(data.to).emit('stopTyping', data.from));
  socket.on('startCall', (data) => io.to(data.to).emit('incomingCall', { from: data.from, callId: data.callId }));
  socket.on('callSignal', (signal) => io.to(signal.to).emit('callSignal', signal));
  socket.on('endCall', (data) => io.to(data.to).emit('callEnded', data.from));

  socket.on('disconnect', () => {
    for (const [userId, socketId] of userConnections.entries()) {
      if (socketId === socket.id) {
        userConnections.delete(userId);
        break;
      }
    }
  });
});

// Catch-all route to serve the React app
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Not Found' });
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`\n🚀 Shadhee Backend Server running on port ${PORT}`);
  console.log(`📡 Socket.io ready for connections on ws://localhost:${PORT}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
});