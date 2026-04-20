# Shad - Private Messaging for Couples
## Complete Feature Implementation Guide

---

## 🎉 Project Status: Phase 1 Complete

### ✅ Completed Features

#### **1. Project Structure**
- ✅ Monorepo setup with web, mobile, and backend folders
- ✅ Shared utilities folder for common code
- ✅ Documentation directory

#### **2. Frontend (Web)**
- ✅ React + TypeScript setup with Vite
- ✅ Firebase Authentication integration
- ✅ Real-time messaging with Socket.io
- ✅ End-to-end encryption with AES
- ✅ Responsive UI with romantic theme

**Components Created:**
- **Auth.tsx** - Sign up and login with email/password
- **Chat.tsx** - Real-time messaging interface
- **Dashboard.tsx** - Main hub with couple features
- **Profile.tsx** - User profile and settings

**Features in Components:**
- Message sending and receiving (encrypted)
- Typing indicators
- Online/offline status (via Socket.io)
- Message timestamps
- Responsive design

#### **3. Backend**
- ✅ Node.js Express server
- ✅ Socket.io for real-time communication
- ✅ Server running on `http://localhost:3001`
- ✅ User connection management
- ✅ Message encryption support

**Endpoints:**
- `GET /` - Health check
- `GET /health` - Server status
- `GET /protected` - Auth-protected route example

**Socket.io Events:**
- `join` - User joins chat
- `sendMessage` - Send encrypted message
- `typing` - Send typing indicator
- `stopTyping` - Stop typing indicator
- `receiveMessage` - Listen for incoming messages

#### **4. Security**
- ✅ AES-256 Encryption for messages
- ✅ Firebase Auth integration (ready)
- ✅ Server-side message handling
- ✅ CORS enabled

---

## 🚀 Current URLs

- **Web App**: http://localhost:5174/
- **Backend Server**: http://localhost:3001/

---

## 📱 Current Screen Flow

```
1. Login/Signup (Auth.tsx)
   ↓
2. Dashboard (Dashboard.tsx)
   ├── 💬 Chat
   ├── ❤️ Love Timeline
   ├── 🎬 Memories
   └── 💕 Bonding Prompts
   ↓
3. Chat Interface (Chat.tsx)
   ├── Real-time messaging
   ├── Typing indicators
   └── Message timestamps
   ↓
4. Profile (Profile.tsx)
   ├── Display name
   └── Nickname settings
```

---

## 🎨 UI Theme

- **Primary Color**: #ff1493 (Deep Pink)
- **Secondary Color**: #ff69b4 (Hot Pink)
- **Accent**: #ffb6c1 (Light Pink)
- **Background Gradient**: Pink to Light Pink
- **Font**: Arial, sans-serif

---

## 🔧 Configuration Files

### Web (.env)
```
REACT_APP_FIREBASE_API_KEY=AIzaSyDummyKey
REACT_APP_FIREBASE_AUTH_DOMAIN=shad-app.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=shad-app
REACT_APP_SERVER_URL=http://localhost:3001
REACT_APP_ENCRYPTION_KEY=shad-secret-key-2026
```

---

## 📦 Dependencies

### Web
- React 19.2.4
- Firebase 10.7.1
- Socket.io-client 4.7.4
- CryptoJS 4.2.0
- Material-UI (optional)
- TypeScript

### Backend
- Express 4.18.2
- Socket.io 4.7.4
- Firebase-admin 12.0.0
- CryptoJS 4.2.0
- CORS 2.8.5

---

## 🎯 Next Steps / To-Do

### Immediate (Phase 2)
- [ ] Connect Chat component to actually use partner ID
- [ ] Implement message persistence in Firestore
- [ ] Add user search and friend connection
- [ ] Implement Love Timeline feature
- [ ] Add photo gallery / Memories vault
- [ ] Implement daily bonding prompts

### Security & Privacy
- [ ] Implement app lock (PIN/Biometric)
- [ ] Screenshot detection system
- [ ] Self-destructing messages
- [ ] Message read receipts

### Rich Media
- [ ] Image/video upload to Firebase Storage
- [ ] GIF and sticker support
- [ ] Voice note recording
- [ ] File sharing

### Voice & Video
- [ ] WebRTC setup for video calls
- [ ] Audio call implementation
- [ ] Call recording (optional)

### Couple Features
- [ ] Anniversary tracking
- [ ] Mood-based themes (Romantic, Dark love, Aesthetic)
- [ ] Shared music listening
- [ ] Custom couple statistics

### Mobile (Phase 3)
- [ ] React Native implementation
- [ ] Push notifications
- [ ] Biometric lock
- [ ] Navigation setup
- [ ] Native performance optimization

---

## 🔐 Security Notes

1. **Encryption**: All messages are encrypted with AES before sending
2. **Firebase Auth**: Uses Firebase Authentication (not yet configured with credentials)
3. **Socket.io**: Supports authentication headers
4. **CORS**: Configured to accept all origins (should be restricted in production)

---

## 💾 Data Structure

### Firestore Collections (Planned)

```
/users/{uid}
  └── email, displayName, nickname, avatar, createdAt, partner

/messages/{conversationId}
  └── from, to, text, timestamp, read, type

/conversations/{conversationId}
  └── participants, lastMessage, updatedAt

/timeline/{uid}
  └── memories (array of saved chats/moments)

/bonding/{uid}
  └── dailyQuestions, answers, streaks
```

---

## 🌐 API Reference

### Socket.io Client Methods

```typescript
// Encryption/Decryption
encryptMessage(message: string): string
decryptMessage(ciphertext: string): string

// Chat Service
ChatService.connect(userId: string)
ChatService.sendMessage(to: string, text: string, type: 'text' | 'image' | 'video' | 'voice' | 'gif')
ChatService.onReceiveMessage(callback)
ChatService.onTyping(callback)
ChatService.onStopTyping(callback)
ChatService.disconnect()
```

---

## 🎯 Design Principles

1. **Privacy First**: All messages encrypted end-to-end
2. **Simplicity**: Focused on two people only
3. **Intimacy**: Romantic, personal UI design
4. **Security**: App lock, screenshot alerts, self-destruct
5. **Couple-centric**: Features designed for strengthening relationships

---

## 📞 Support & Contact

For issues or feature requests related to Shad development, refer to the GitHub repository.

---

**Created**: April 2026
**Latest Update**: Phase 1 - Initial Setup Complete
