#!/bin/bash

# Shadhee Video Call Setup Script
# Run this script to set up the development environment

echo "🚀 Shadhee Video Call Setup"
echo "============================"
echo ""

# Function to print messages
print_status() {
  echo "✅ $1"
}

print_error() {
  echo "❌ $1"
}

print_info() {
  echo "ℹ️  $1"
}

# Check Node.js
if ! command -v node &> /dev/null; then
  print_error "Node.js is not installed. Please install Node.js 14+ first."
  exit 1
fi
print_status "Node.js found: $(node --version)"

# Check npm
if ! command -v npm &> /dev/null; then
  print_error "npm is not installed."
  exit 1
fi
print_status "npm found: $(npm --version)"

echo ""
echo "📦 Installing dependencies..."
echo ""

# Backend setup
echo "📡 Setting up backend..."
cd backend
if [ ! -d "node_modules" ]; then
  npm install
  if [ $? -eq 0 ]; then
    print_status "Backend dependencies installed"
  else
    print_error "Failed to install backend dependencies"
    exit 1
  fi
else
  print_status "Backend dependencies already installed"
fi
cd ..

# Frontend setup
echo "🎨 Setting up frontend..."
cd web
if [ ! -d "node_modules" ]; then
  npm install
  if [ $? -eq 0 ]; then
    print_status "Frontend dependencies installed"
  else
    print_error "Failed to install frontend dependencies"
    exit 1
  fi
else
  print_status "Frontend dependencies already installed"
fi

# Check .env file
if [ ! -f ".env" ]; then
  print_info "Creating .env file from template..."
  cat > .env << 'EOF'
# Backend API Configuration
VITE_SERVER_URL=http://localhost:3001

# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyDummyKey
VITE_FIREBASE_AUTH_DOMAIN=shad-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=shad-app-dev
VITE_FIREBASE_STORAGE_BUCKET=shad-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Encryption Configuration
VITE_ENCRYPTION_KEY=shad-secret-key-2026

# API Timeouts (in milliseconds)
VITE_API_TIMEOUT=10000

# Feature Flags
VITE_ENABLE_SOCKET_IO=true
VITE_ENABLE_REST_API=true
EOF
  print_status ".env file created"
else
  print_status ".env file already exists"
fi

cd ..

echo ""
echo "✨ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Update .env files with your Firebase credentials"
echo "2. Start backend: cd backend && npm run dev"
echo "3. Start frontend: cd web && npm run dev"
echo "4. Open http://localhost:5173 in your browser"
echo ""
echo "📚 Documentation:"
echo "- Video Call Guide: ../VIDEO_CALL_GUIDE.md"
echo "- API Endpoints: ../API_ENDPOINTS.md"
echo "- README: ../README.md"
echo ""
echo "🎮 Enjoy using Shadhee!"
