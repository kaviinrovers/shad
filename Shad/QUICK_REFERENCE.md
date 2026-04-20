# 🎯 Quick Reference - Video Call API

## 🚀 Start Here

```bash
# 1. Setup (Run once)
./setup.sh              # Linux/Mac
setup.bat              # Windows

# 2. Start Backend (Terminal 1)
cd backend && npm run dev

# 3. Start Frontend (Terminal 2)
cd web && npm run dev

# 4. Open Browser
http://localhost:5173
```

---

## 📱 Common Tasks

### Start a Video Call
```typescript
import { VideoCallApi } from '@/services';

const response = await VideoCallApi.initiateCall(partnerId);
```

### Send a Message
```typescript
import ChatService from '@/services/ChatService';

ChatService.connect(userId);
ChatService.sendMessage(partnerId, 'Hello!', 'text');
```

### Send Voice Message
```typescript
const audioBlob = new Blob([audioData], { type: 'audio/wav' });
await ChatApi.sendVoiceMessage(partnerId, audioBlob, 30);
```

### Get Call History
```typescript
const history = await VideoCallApi.getCallHistory(50, 0);
```

### Check Server Health
```typescript
const health = await ApiClient.checkHealth();
```

---

## 🔌 API Services Overview

| Service | Purpose | Type |
|---------|---------|------|
| **ApiClient** | Base HTTP client | REST |
| **AuthApi** | User authentication | REST |
| **ChatApi** | Messages & chat rooms | REST |
| **VideoCallApi** | Video calls | REST |
| **ChatService** | Real-time messaging | Socket.io |

---

## 📡 Backend Ports

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001
- **Socket.io:** ws://localhost:3001

---

## 🔧 Environment Variables

```env
VITE_SERVER_URL=http://localhost:3001
VITE_FIREBASE_API_KEY=your-key
VITE_ENABLE_SOCKET_IO=true
```

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| Camera not working | Check browser permissions |
| Can't connect | Verify backend running on port 3001 |
| WebRTC fails | Check network/firewall, use HTTPS for production |
| Authentication fails | Verify .env file, check Firebase config |

---

## 📚 Documentation Files

- `VIDEO_CALL_GUIDE.md` - Comprehensive guide
- `API_ENDPOINTS.md` - All endpoints reference
- `API_INTEGRATION_SUMMARY.md` - Integration overview

---

## 💡 Tips

✅ Always call `ChatService.connect(userId)` first
✅ Use `ApiClient.setAuthToken(token)` after login
✅ Check console for detailed error messages
✅ Test with two browser windows for video calls
✅ Use headphones to avoid audio feedback

---

## 📞 Getting Help

1. Check browser console (F12)
2. Check backend logs (npm run dev output)
3. Review `VIDEO_CALL_GUIDE.md` troubleshooting
4. Check `API_ENDPOINTS.md` for endpoint details

---

## ✨ Key Features

🎥 **Video Calling** - WebRTC with simple-peer
💬 **Real-time Messaging** - Socket.io for live chat
🎤 **Voice Messages** - Record and send audio
🔐 **Secure** - End-to-end encryption
📱 **Responsive** - Works on desktop and mobile

---

## 🎯 Next Steps

1. Run setup script
2. Start backend server
3. Start frontend server
4. Create test account
5. Test video call feature
6. Deploy to production

Enjoy! 🚀
