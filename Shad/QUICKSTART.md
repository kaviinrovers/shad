# Quick Start Guide - Shad App

## Prerequisites
- Node.js (v16+)
- npm or yarn
- Modern web browser
- Git (optional)

---

## 🚀 Running the Application

### 1. Start the Backend Server

```bash
cd c:\Users\ELCOT\Shad\backend
npm install  # If not already installed
node server.js
```

**Expected Output:**
```
🚀 Shad Backend Server running on port 3001
📡 Socket.io ready for connections
```

**Verify Backend** (open in browser):
```
http://localhost:3001/
```

---

### 2. Start the Web Application

In a **new terminal**:

```bash
cd c:\Users\ELCOT\Shad\web
npm install  # If not already installed
npm run dev
```

**Expected Output:**
```
VITE v8.0.5 ready in XXX ms
➜ Local: http://localhost:5173/ (or 5174 if port in use)
```

**Access the App** (open in browser):
```
http://localhost:5173/
```

---

## 📱 Features You Can Test Now

### **Authentication**
1. Go to http://localhost:5173/
2. Click "Sign Up" to create a new account
3. Enter email, password, and display name
4. Successfully logged in!

### **Dashboard**
- View your profile and customize nickname
- Navigate between different couple features
- Access chat, timeline, memories, and bonding prompts

### **Profile Settings**
- Set your display name
- Set a custom nickname for your partner
- View your email

---

## 🔐 Test Data

### Demo Credentials (for future use)
```
User 1:
Email: lover1@shad.app
Password: Shad@2026

User 2:
Email: lover2@shad.app
Password: Shad@2026
```

---

## 🛠️ Troubleshooting

### **Backend won't start**
```bash
# Kill the process on port 3001
npx kill-port 3001

# Try again
node server.js
```

### **Web app won't load**
```bash
# Clear node_modules and reinstall
rm -r node_modules
npm install
npm run dev
```

### **Port already in use**
- Backend will auto-select 3001, or change `REACT_APP_SERVER_URL` in `.env`
- Web app will auto-select next available port (5174, 5175, etc.)

---

## 📋 Development Commands

### Web Development
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run lint     # Check code quality
npm run preview  # Preview production build
```

### Backend Development
```bash
node server.js              # Start server
npm run dev                 # Start with nodemon (auto-restart)
npm install nodemon --save  # If nodemon missing
```

---

## 🎨 Customization

### Change Theme Colors
Edit `src/App.css` and component CSS files:
```css
Primary: #ff1493
Secondary: #ff69b4
Accent: #ffb6c1
```

### Change App Name
Update in:
- `web/index.html` title
- `web/src/components/Dashboard.tsx`
- `web/public/logo.svg`

---

## 📚 File Structure

```
Shad/
├── web/                    # React web app
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # Auth context
│   │   ├── services/       # Chat service
│   │   ├── config/         # Firebase config
│   │   ├── utils/          # Encryption utilities
│   │   ├── App.tsx         # Main app
│   │   └── App.css
│   ├── index.html
│   ├── package.json
│   └── .env               # Environment vars
│
├── backend/                # Node.js server
│   ├── server.js          # Main server file
│   ├── package.json
│   └── .env               # Backend env vars
│
├── mobile/                 # React Native (future)
│   └── ...
│
└── README.md              # This file
```

---

## 🔗 Live URLs

| Service | URL | Status |
|---------|-----|--------|
| Web App | http://localhost:5173 | ✅ Running |
| Backend | http://localhost:3001 | ✅ Running |
| WebSocket | localhost:3001 | ✅ Connected |

---

## 📝 Environment Variables

### Frontend (.env)
```
REACT_APP_SERVER_URL=http://localhost:3001
REACT_APP_ENCRYPTION_KEY=shad-secret-key-2026
REACT_APP_FIREBASE_PROJECT_ID=shad-app
```

### Backend
- No env file needed for local testing
- Uses default port 3001

---

## ✅ Verification Checklist

- [ ] Backend running on 3001
- [ ] Web app accessible on 5173/5174
- [ ] Can create account
- [ ] Can login
- [ ] Dashboard loads
- [ ] Profile page works

---

## 🎯 Next Steps

1. **Test the UI** - Create an account and explore
2. **Customize Theme** - Update colors in CSS files
3. **Add Firebase** - Configure Firebase credentials
4. **Implement Chat** - Add partner connection flow
5. **Add Features** - Love Timeline, Memories, etc.

---

## 📞 Quick Links

- Frontend: `c:\Users\ELCOT\Shad\web`
- Backend: `c:\Users\ELCOT\Shad\backend`
- Config: `web/.env`
- Implementation Guide: `IMPLEMENTATION_GUIDE.md`

---

**Happy coding! 💕**
