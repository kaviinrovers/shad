# 🚀 Shadhee Deployment Guide

## Overview
Shadhee is a full-stack couples messaging app with:
- **Frontend**: React + Vite (static hosting)
- **Backend**: Node.js + Socket.io (server hosting)
- **Real-time messaging** with end-to-end encryption

## Quick Deploy (Recommended)

### 1. Frontend → Vercel (Free)
```bash
cd web
npm install
npm run build
npx vercel --prod
```
- Copy the deployment URL (e.g., `https://shadhee.vercel.app`)

### 2. Backend → Railway (Free tier available)
```bash
cd backend
npm install
railway login
railway init
railway up
```
- Copy the backend URL (e.g., `https://shadhee-backend.railway.app`)

### 3. Update Environment Variables
- **Frontend**: Set `VITE_SERVER_URL=https://your-backend-url`
- **Backend**: Set `FRONTEND_URL=https://your-frontend-url`

## Alternative Platforms

### Frontend Alternatives
- **Netlify**: `npm run build && netlify deploy --prod --dir=dist`
- **GitHub Pages**: Use GitHub Actions for automated deployment
- **Firebase Hosting**: `firebase deploy`

### Backend Alternatives
- **Heroku**: `git push heroku main`
- **Render**: Connect GitHub repo, auto-deploys
- **DigitalOcean App Platform**: Git-based deployment
- **AWS EC2**: Manual server setup

## Production Checklist

### 🔐 Security
- [ ] Change encryption keys to strong random values
- [ ] Set up real Firebase authentication
- [ ] Enable HTTPS (automatic on most platforms)
- [ ] Add rate limiting for API endpoints

### 💾 Database
- [ ] Replace in-memory storage with MongoDB/PostgreSQL
- [ ] Add user profile persistence
- [ ] Store message history
- [ ] Implement partner relationship storage

### 📊 Monitoring
- [ ] Add error logging (Sentry, LogRocket)
- [ ] Set up uptime monitoring
- [ ] Add analytics (Google Analytics, Mixpanel)

### 🚀 Performance
- [ ] Enable gzip compression
- [ ] Set up CDN for static assets
- [ ] Optimize bundle size
- [ ] Add service worker for offline support

## Environment Variables Setup

### Frontend (.env.production)
```
VITE_SERVER_URL=https://your-backend-domain.com
VITE_ENCRYPTION_KEY=your-secure-key-here
VITE_FIREBASE_API_KEY=your-firebase-key
# ... other Firebase vars
```

### Backend (.env.production)
```
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
ENCRYPTION_KEY=your-secure-key-here
# ... Firebase admin vars
```

## Testing Deployment

1. **Frontend**: Visit your deployed URL
2. **Backend**: Check `/health` endpoint returns JSON
3. **Socket.io**: Open browser console, should see "Connected to chat server"
4. **Messaging**: Create two accounts, connect partners, send messages

## Troubleshooting

### Common Issues
- **CORS errors**: Check `FRONTEND_URL` in backend env vars
- **Socket.io not connecting**: Verify backend URL in frontend env vars
- **Blank page**: Check browser console for JavaScript errors
- **Auth not working**: Ensure Firebase config is correct

### Debug Commands
```bash
# Test backend locally
cd backend && npm start

# Test frontend build
cd web && npm run build && npm run preview

# Check environment variables
echo $VITE_SERVER_URL
```

## Cost Estimation

### Free Tier Options
- **Vercel**: 100GB bandwidth/month
- **Railway**: 512MB RAM, 1GB disk
- **Netlify**: 100GB bandwidth/month

### Paid Upgrades (if needed)
- **Railway**: $5/month for 1GB RAM
- **Vercel**: $20/month for Pro features
- **Custom domain**: ~$15/year

---

🎉 **Happy deploying!** Your couples messaging app is ready for the world! 💕