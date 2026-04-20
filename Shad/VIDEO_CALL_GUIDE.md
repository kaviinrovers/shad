# Video Call & API Integration Guide

## 🎯 Overview

This guide covers the complete setup and usage of the audio/video calling feature in Shadhee, including API integration, configuration, and troubleshooting.

## 📋 Prerequisites

- Node.js 14+ installed
- Frontend and backend servers configured
- WebRTC support in the browser (Chrome, Firefox, Safari, Edge)
- HTTPS enabled (required for camera/microphone access in production)
- Proper browser permissions granted for camera and microphone

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
```

Ensure these packages are installed:
```json
{
  "express": "^4.18.0",
  "socket.io": "^4.5.0",
  "cors": "^2.8.5",
  "firebase-admin": "^11.0.0",
  "dotenv": "^16.0.0"
}
```

### 2. Frontend Setup

```bash
cd web
npm install
```

Ensure these packages are installed:
```json
{
  "socket.io-client": "^4.7.4",
  "simple-peer": "^9.11.1",
  "react": "^18.3.1"
}
```

### 3. Environment Configuration

Create `.env` file in the `web` directory:

```env
# Backend API Configuration
VITE_SERVER_URL=http://localhost:3001

# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Feature Flags
VITE_ENABLE_SOCKET_IO=true
VITE_ENABLE_REST_API=true
```

For production, create `.env.production`:

```env
VITE_SERVER_URL=https://your-deployed-backend.com
VITE_FIREBASE_API_KEY=your-production-api-key
# ... other production config
```

## 🔌 API Services

### ApiClient (Base Client)

Location: `web/src/services/ApiClient.ts`

Generic HTTP client with automatic authentication handling.

**Methods:**
- `get<T>(endpoint, options?)` - GET request
- `post<T>(endpoint, data, options?)` - POST request
- `put<T>(endpoint, data, options?)` - PUT request
- `delete<T>(endpoint, options?)` - DELETE request
- `setAuthToken(token)` - Store auth token
- `clearAuthToken()` - Remove auth token
- `checkHealth()` - Check server health

**Example Usage:**
```typescript
import ApiClient from '@/services/ApiClient';

// Check server health
const health = await ApiClient.checkHealth();
if (health.success) {
  console.log('Server is healthy');
}

// Set authentication token
const token = 'your-jwt-token';
ApiClient.setAuthToken(token);
```

### AuthApi (Authentication)

Location: `web/src/services/AuthApi.ts`

Handles user authentication and profile management.

**Methods:**
- `signup(email, password, displayName)` - Register new user
- `login(email, password)` - Login user
- `logout()` - Logout user
- `getProfile()` - Get current user profile
- `updateProfile(displayName, nickname, avatar)` - Update profile
- `verifyToken(token)` - Verify JWT token
- `getUserById(userId)` - Get user by ID
- `searchUsers(query)` - Search users
- `connectWithPartner(partnerEmail)` - Connect with partner
- `getPartnerInfo()` - Get connected partner info
- `disconnectPartner()` - Disconnect from partner

**Example Usage:**
```typescript
import AuthApi from '@/services/AuthApi';

// Login user
const loginResponse = await AuthApi.login('user@example.com', 'password123');
if (loginResponse.success) {
  ApiClient.setAuthToken(loginResponse.data.token);
  console.log('User logged in:', loginResponse.data);
}

// Update profile
const updateResponse = await AuthApi.updateProfile('John Doe', 'jonny', 'avatar-url');
if (updateResponse.success) {
  console.log('Profile updated');
}
```

### ChatApi (Messaging)

Location: `web/src/services/ChatApi.ts`

Handles chat messages, voice messages, and chat room management.

**Methods:**
- `getChatRooms()` - Get all chat rooms
- `getChatRoom(userId)` - Get specific chat room
- `getMessageHistory(userId, limit, offset)` - Get message history
- `sendMessage(to, text, type)` - Send text message (REST fallback)
- `sendVoiceMessage(to, audioBlob, duration)` - Send voice message
- `markAsRead(messageId)` - Mark message as read
- `markAllAsRead(userId)` - Mark all messages from user as read
- `deleteMessage(messageId)` - Delete message
- `deleteConversation(userId)` - Delete entire conversation
- `searchMessages(userId, query)` - Search messages
- `getUnreadCount()` - Get unread message count

**Example Usage:**
```typescript
import ChatApi from '@/services/ChatApi';

// Get chat rooms
const roomsResponse = await ChatApi.getChatRooms();
if (roomsResponse.success) {
  console.log('Chat rooms:', roomsResponse.data);
}

// Send message
const msgResponse = await ChatApi.sendMessage('partner-id', 'Hello!', 'text');
if (msgResponse.success) {
  console.log('Message sent');
}

// Send voice message
const voiceBlob = new Blob([audioData], { type: 'audio/wav' });
const voiceResponse = await ChatApi.sendVoiceMessage('partner-id', voiceBlob, 30);
```

### VideoCallApi (Video Calling)

Location: `web/src/services/VideoCallApi.ts`

Handles video call lifecycle and management.

**Methods:**
- `initiateCall(to)` - Start a call
- `acceptCall(callId)` - Accept incoming call
- `rejectCall(callId)` - Reject incoming call
- `endCall(callId)` - End active call
- `getCallHistory(limit, offset)` - Get call history
- `getCallDetails(callId)` - Get specific call details
- `getPendingCalls()` - Get pending incoming calls
- `getOngoingCalls()` - Get ongoing calls
- `sendIceCandidate(callId, candidate)` - Send ICE candidate
- `sendOffer(callId, offer)` - Send SDP offer
- `sendAnswer(callId, answer)` - Send SDP answer

**Example Usage:**
```typescript
import VideoCallApi from '@/services/VideoCallApi';

// Initiate call
const callResponse = await VideoCallApi.initiateCall('partner-id');
if (callResponse.success) {
  const callId = callResponse.data.id;
  console.log('Call initiated:', callId);
}

// Get call history
const historyResponse = await VideoCallApi.getCallHistory(50, 0);
if (historyResponse.success) {
  console.log('Call history:', historyResponse.data);
}
```

## 📞 Video Call Component Usage

### Basic Implementation

```typescript
import { VideoCall } from '@/components/VideoCall';

function MyComponent() {
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [partnerId, setPartnerId] = useState('partner-user-id');
  const [currentUserId, setCurrentUserId] = useState('my-user-id');

  return (
    <>
      <button onClick={() => setShowVideoCall(true)}>
        Start Video Call
      </button>

      {showVideoCall && (
        <VideoCall
          partnerId={partnerId}
          currentUserId={currentUserId}
          onEndCall={() => setShowVideoCall(false)}
          isIncoming={false}
        />
      )}
    </>
  );
}
```

### Handling Incoming Calls

```typescript
import { VideoCall } from '@/components/VideoCall';
import ChatService from '@/services/ChatService';

function ChatComponent() {
  const [incomingCall, setIncomingCall] = useState<string | null>(null);

  useEffect(() => {
    ChatService.onIncomingCall((from) => {
      setIncomingCall(from);
    });
  }, []);

  return (
    <>
      {incomingCall && (
        <VideoCall
          partnerId={incomingCall}
          currentUserId={currentUserId}
          isIncoming={true}
          onEndCall={() => setIncomingCall(null)}
          onAccept={() => {
            ChatService.acceptCall(incomingCall);
            // Component will handle the rest
          }}
          onReject={() => {
            ChatService.rejectCall(incomingCall);
            setIncomingCall(null);
          }}
        />
      )}
    </>
  );
}
```

## 🔌 ChatService (Socket.io Integration)

Location: `web/src/services/ChatService.ts`

Real-time communication using Socket.io.

### Connection & Messaging

```typescript
import ChatService from '@/services/ChatService';

// Connect to server
ChatService.connect(userId);

// Send message
ChatService.sendMessage(partnerId, 'Hello!', 'text');

// Listen for messages
ChatService.onReceiveMessage((message) => {
  console.log('Received:', message.text);
});

// Send voice message
const audioBlob = new Blob([audioData], { type: 'audio/wav' });
ChatService.sendVoiceMessage(partnerId, audioBlob, 30);

// Listen for voice messages
ChatService.onVoiceMessage((message) => {
  console.log('Voice message from:', message.from);
});
```

### Typing Indicators

```typescript
// Send typing indicator
ChatService.sendTyping(partnerId);

// Send stop typing
ChatService.sendStopTyping(partnerId);

// Listen for typing
ChatService.onTyping((from) => {
  console.log(`${from} is typing...`);
});

ChatService.onStopTyping((from) => {
  console.log(`${from} stopped typing`);
});
```

### Call Management

```typescript
// Start call
ChatService.startCall(partnerId);

// Handle incoming call
ChatService.onIncomingCall((from) => {
  console.log(`Incoming call from ${from}`);
});

// Accept call
ChatService.acceptCall(from);

// Reject call
ChatService.rejectCall(from);

// Listen for call acceptance
ChatService.onCallAccepted((from) => {
  console.log('Call accepted by:', from);
});

// Listen for call rejection
ChatService.onCallRejected((from) => {
  console.log('Call rejected by:', from);
});

// End call
ChatService.endCall(partnerId);

// Listen for call end
ChatService.onCallEnded((from) => {
  console.log('Call ended by:', from);
});
```

## 🎥 WebRTC Signaling Flow

```
Caller                               Callee
  |                                    |
  |------ initiateCall() REST API ---->|
  |                                    |
  |------ startCall() Socket.io SIGNAL |
  |         (offer)                    |
  |                                    |
  |<----- acceptCall() Socket.io ------| 
  |         (answer)                   |
  |                                    |
  |<------ callSignal (answer) --------|
  |                                    |
  |------ callSignal (ICE) ----------->|
  |                                    |
  |<------ callSignal (ICE) -----------|
  |                                    |
  | ===== WebRTC Connection ===== |
  |        Video & Audio Stream         |
```

## 🔒 Security Considerations

### 1. Authentication
- All API calls include Bearer token in Authorization header
- Tokens are stored in localStorage (consider secure alternatives)
- Implement token refresh mechanism

### 2. Encryption
- Messages are encrypted using `crypto-js`
- Voice messages are also encrypted before transmission
- HTTPS should be used in production

### 3. Permissions
- Always request camera/microphone permissions explicitly
- Provide fallback if permissions denied
- Show clear error messages to users

### 4. Data Validation
- Validate user IDs on backend
- Check user authorization for protected routes
- Sanitize all user inputs

## 🐛 Troubleshooting

### Camera/Microphone Not Working

**Error:** "Could not access camera/microphone"

**Solutions:**
1. Check browser permissions (Settings > Privacy)
2. Ensure HTTPS in production (camera access requires secure context)
3. Check if another app is using the camera
4. Try a different browser
5. Restart browser or device

### Connection Issues

**Error:** "Failed to connect to server"

**Solutions:**
1. Verify backend is running: `npm run dev` in `/backend`
2. Check `.env` file has correct `VITE_SERVER_URL`
3. Ensure firewall allows port 3001 (or your configured port)
4. Check browser console for CORS errors
5. Clear browser cache and reload

### Audio/Video Not Displaying

**Problem:** Video stream not showing

**Solutions:**
1. Check console for WebRTC errors
2. Verify STUN servers are accessible
3. Ensure peer connection established (check `callStatus`)
4. Test with different peer (rule out local issue)
5. Check network connectivity

### Echo or Audio Issues

**Solutions:**
1. Enable echo cancellation (auto-enabled)
2. Use headphones to avoid feedback
3. Adjust microphone levels in system settings
4. Ensure only one audio stream active

## 📊 API Response Format

All API responses follow this format:

```typescript
{
  success: boolean;
  data?: any;        // Response data if successful
  message?: string;  // Optional message
  error?: string;    // Error message if failed
}
```

## 🧪 Testing

### Manual Testing

1. **Open two browser windows**
   ```
   Window 1: http://localhost:5173 (User A)
   Window 2: http://localhost:5173 (User B)
   ```

2. **Login with different accounts**
   - Window 1: Login as User A
   - Window 2: Login as User B

3. **Test Video Call**
   - Window 1: Click "Start Video Call" → Select User B
   - Window 2: Should see incoming call notification
   - Window 2: Click "Accept"
   - Both windows: Should show video streams

4. **Test Controls**
   - Mute/Unmute audio
   - Turn video on/off
   - End call

5. **Test Chat**
   - Send text messages
   - Send voice messages
   - Check message history

## 📞 Support

For issues or questions:
1. Check browser console for errors
2. Check backend logs for server errors
3. Review this guide's troubleshooting section
4. Check network tab in DevTools for failed requests

## 🔄 Updates & Maintenance

- Keep dependencies updated: `npm update`
- Monitor performance in production
- Review security advisories regularly
- Backup call records periodically
- Monitor server logs for errors
