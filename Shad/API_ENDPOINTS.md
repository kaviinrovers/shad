# API Endpoints Reference

## Base URL
- **Development:** `http://localhost:3001`
- **Production:** `https://your-deployed-backend.com`

All protected endpoints require an `Authorization` header:
```
Authorization: Bearer {JWT_TOKEN}
```

---

## 🏥 Health & Status

### Server Health
```
GET /health
```
Returns server status and connected users count.

**Response:**
```json
{
  "status": "healthy",
  "uptime": 3600,
  "connectedUsers": 5
}
```

### Get User Status
```
GET /users/:userId
```
Check if a user is online.

**Response:**
```json
{
  "userId": "user123",
  "socketId": "socket-id",
  "online": true
}
```

---

## 🔐 Authentication

### Login
```
POST /auth/login
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt-token",
    "userId": "user123",
    "email": "user@example.com"
  }
}
```

### Signup
```
POST /auth/signup
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "displayName": "John Doe"
}
```

### Get Profile
```
GET /auth/profile
Authorization: Bearer {TOKEN}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "uid": "user123",
    "email": "user@example.com",
    "displayName": "John Doe",
    "nickname": "johnny",
    "avatar": "url",
    "createdAt": "2026-04-10T00:00:00Z"
  }
}
```

### Update Profile
```
PUT /auth/profile
Authorization: Bearer {TOKEN}
```

**Body:**
```json
{
  "displayName": "John Smith",
  "nickname": "john",
  "avatar": "https://..."
}
```

### Logout
```
POST /auth/logout
Authorization: Bearer {TOKEN}
```

---

## 📞 Video Calls

### Initiate Call
```
POST /calls/initiate
Authorization: Bearer {TOKEN}
```

**Body:**
```json
{
  "to": "recipient-user-id"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "call-1234567890-abc123",
    "from": "caller-id",
    "to": "recipient-id",
    "status": "pending",
    "startTime": 1712700000000
  }
}
```

### Accept Call
```
POST /calls/{callId}/accept
Authorization: Bearer {TOKEN}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "call-id",
    "status": "accepted",
    "acceptedAt": 1712700010000
  }
}
```

### Reject Call
```
POST /calls/{callId}/reject
Authorization: Bearer {TOKEN}
```

### End Call
```
POST /calls/{callId}/end
Authorization: Bearer {TOKEN}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "call-id",
    "status": "ended",
    "endTime": 1712700060000,
    "duration": 60
  }
}
```

### Get Call History
```
GET /calls/history?limit=50&offset=0
Authorization: Bearer {TOKEN}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "call-id",
      "from": "user1",
      "to": "user2",
      "status": "ended",
      "startTime": 1712700000000,
      "endTime": 1712700060000,
      "duration": 60
    }
  ],
  "total": 1
}
```

### Get Pending Calls
```
GET /calls/pending
Authorization: Bearer {TOKEN}
```

Returns all incoming calls awaiting response.

### Get Ongoing Calls
```
GET /calls/ongoing
Authorization: Bearer {TOKEN}
```

Returns all active calls.

### Get Call Details
```
GET /calls/{callId}
Authorization: Bearer {TOKEN}
```

---

## 💬 Chat & Messaging

### Get Chat Rooms
```
GET /chat/rooms
Authorization: Bearer {TOKEN}
```

### Get Chat Room with User
```
GET /chat/rooms/{userId}
Authorization: Bearer {TOKEN}
```

### Get Message History
```
GET /chat/messages/{userId}?limit=50&offset=0
Authorization: Bearer {TOKEN}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "msg-123",
      "from": "user1",
      "to": "user2",
      "text": "encrypted-message-here",
      "timestamp": 1712700000000,
      "read": true,
      "type": "text"
    }
  ]
}
```

### Send Message
```
POST /chat/messages
Authorization: Bearer {TOKEN}
```

**Body:**
```json
{
  "to": "recipient-id",
  "text": "encrypted-message",
  "type": "text"
}
```

### Mark Message as Read
```
PUT /chat/messages/{messageId}/read
Authorization: Bearer {TOKEN}
```

### Mark All Messages as Read
```
PUT /chat/messages/{userId}/read-all
Authorization: Bearer {TOKEN}
```

### Delete Message
```
DELETE /chat/messages/{messageId}
Authorization: Bearer {TOKEN}
```

### Delete Conversation
```
DELETE /chat/rooms/{userId}
Authorization: Bearer {TOKEN}
```

### Search Messages
```
GET /chat/messages/{userId}/search?q=search-term
Authorization: Bearer {TOKEN}
```

### Get Unread Count
```
GET /chat/unread
Authorization: Bearer {TOKEN}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 5,
    "byUser": {
      "user1": 2,
      "user2": 3
    }
  }
}
```

### Send Voice Message
```
POST /chat/voice-messages
Authorization: Bearer {TOKEN}
Content-Type: multipart/form-data
```

**Form Data:**
- `to` - Recipient user ID
- `audio` - Audio blob
- `duration` - Duration in seconds

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "voice-123",
    "from": "user1",
    "to": "user2",
    "type": "voice",
    "duration": 30,
    "timestamp": 1712700000000
  }
}
```

### Send Typing Indicator
```
POST /chat/typing
Authorization: Bearer {TOKEN}
```

**Body:**
```json
{
  "to": "recipient-id"
}
```

---

## 👥 Users & Connections

### Get User by ID
```
GET /users/{userId}
```

### Search Users
```
GET /users/search?q=search-term
Authorization: Bearer {TOKEN}
```

### Connect with Partner
```
POST /users/connect
Authorization: Bearer {TOKEN}
```

**Body:**
```json
{
  "partnerEmail": "partner@example.com"
}
```

### Get Partner Info
```
GET /users/partner
Authorization: Bearer {TOKEN}
```

### Disconnect from Partner
```
POST /users/disconnect
Authorization: Bearer {TOKEN}
```

---

## 🔄 Real-time Events (Socket.io)

### Connection
```javascript
socket.on('connect', () => {
  // Emit join event with user ID
  socket.emit('join', userId);
});

socket.on('connected', (data) => {
  console.log(data.message); // Successfully connected
});
```

### Messages
```javascript
// Send message
socket.emit('sendMessage', {
  from: userId,
  to: recipientId,
  text: encryptedText,
  timestamp: Date.now(),
  type: 'text'
});

// Receive message
socket.on('receiveMessage', (message) => {
  // Handle received message
});
```

### Typing
```javascript
// Send typing indicator
socket.emit('typing', { from: userId, to: recipientId });

// Receive typing indicator
socket.on('typing', (from) => {
  // User is typing
});
```

### Video Calls
```javascript
// Start call
socket.emit('startCall', { from: userId, to: recipientId });

// Receive incoming call
socket.on('incomingCall', (from) => {
  // Handle incoming call
});

// Accept call
socket.emit('acceptCall', { from: userId, to: callerId });

// Call accepted
socket.on('callAccepted', (from) => {
  // Handle call acceptance
});

// End call
socket.emit('endCall', { from: userId, to: recipientId });

// Call ended
socket.on('callEnded', (from) => {
  // Handle call end
});
```

### Call Signaling (WebRTC)
```javascript
// Send signaling data
socket.emit('callSignal', {
  from: userId,
  to: recipientId,
  type: 'offer|answer|ice-candidate',
  data: signalData
});

// Receive signaling data
socket.on('callSignal', (signal) => {
  // Handle signal
});
```

### Voice Messages
```javascript
// Send voice message
socket.emit('sendVoiceMessage', {
  from: userId,
  to: recipientId,
  audio: encryptedAudioBase64,
  duration: 30,
  timestamp: Date.now()
});

// Receive voice message
socket.on('voiceMessage', (message) => {
  // Handle voice message
});
```

---

## ✅ Status Codes

- **200** - Success
- **201** - Created
- **400** - Bad Request
- **401** - Unauthorized
- **403** - Forbidden
- **404** - Not Found
- **500** - Server Error

---

## 🔒 Error Responses

```json
{
  "success": false,
  "error": "Error message"
}
```

Common errors:
- `No token` - Missing authorization header
- `Invalid token` - Token is invalid or expired
- `Unauthorized` - User not authorized for this action
- `User not found` - Specified user doesn't exist
- `Call not found` - Specified call doesn't exist
