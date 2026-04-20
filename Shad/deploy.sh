#!/bin/bash

# Shadhee Deployment Script
echo "🚀 Deploying Shadhee..."

# Build frontend
echo "📦 Building frontend..."
cd web
npm run build

# Deploy frontend to Vercel (or your chosen platform)
echo "🌐 Deploying frontend to Vercel..."
npx vercel --prod

# Deploy backend to Railway (or your chosen platform)
echo "⚙️ Deploying backend to Railway..."
cd ../backend
railway deploy

echo "✅ Deployment complete!"
echo "📱 Frontend: Check your Vercel dashboard"
echo "🔧 Backend: Check your Railway dashboard"