@echo off
REM Shadhee Video Call Setup Script for Windows
REM Run this script to set up the development environment

echo.
echo 🚀 Shadhee Video Call Setup
echo ============================
echo.

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo ❌ Node.js is not installed. Please install Node.js 14+ first.
  pause
  exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js found: %NODE_VERSION%

REM Check npm
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo ❌ npm is not installed.
  pause
  exit /b 1
)
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✅ npm found: %NPM_VERSION%

echo.
echo 📦 Installing dependencies...
echo.

REM Backend setup
echo 📡 Setting up backend...
cd backend
if not exist "node_modules" (
  call npm install
  if %ERRORLEVEL% EQU 0 (
    echo ✅ Backend dependencies installed
  ) else (
    echo ❌ Failed to install backend dependencies
    cd ..
    pause
    exit /b 1
  )
) else (
  echo ✅ Backend dependencies already installed
)
cd ..

REM Frontend setup
echo 🎨 Setting up frontend...
cd web
if not exist "node_modules" (
  call npm install
  if %ERRORLEVEL% EQU 0 (
    echo ✅ Frontend dependencies installed
  ) else (
    echo ❌ Failed to install frontend dependencies
    cd ..
    pause
    exit /b 1
  )
) else (
  echo ✅ Frontend dependencies already installed
)

REM Check .env file
if not exist ".env" (
  echo ℹ️  Creating .env file from template...
  (
    echo # Backend API Configuration
    echo VITE_SERVER_URL=http://localhost:3001
    echo.
    echo # Firebase Configuration
    echo VITE_FIREBASE_API_KEY=AIzaSyDummyKey
    echo VITE_FIREBASE_AUTH_DOMAIN=shad-app.firebaseapp.com
    echo VITE_FIREBASE_PROJECT_ID=shad-app-dev
    echo VITE_FIREBASE_STORAGE_BUCKET=shad-app.appspot.com
    echo VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
    echo VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
    echo.
    echo # Encryption Configuration
    echo VITE_ENCRYPTION_KEY=shad-secret-key-2026
    echo.
    echo # API Timeouts
    echo VITE_API_TIMEOUT=10000
    echo.
    echo # Feature Flags
    echo VITE_ENABLE_SOCKET_IO=true
    echo VITE_ENABLE_REST_API=true
  ) > .env
  echo ✅ .env file created
) else (
  echo ✅ .env file already exists
)

cd ..

echo.
echo ✨ Setup complete!
echo.
echo 📝 Next steps:
echo 1. Update .env files with your Firebase credentials
echo 2. Start backend: cd backend ^&^& npm run dev
echo 3. Start frontend: cd web ^&^& npm run dev
echo 4. Open http://localhost:5173 in your browser
echo.
echo 📚 Documentation:
echo - Video Call Guide: VIDEO_CALL_GUIDE.md
echo - API Endpoints: API_ENDPOINTS.md
echo - README: README.md
echo.
echo 🎮 Enjoy using Shadhee!
echo.
pause
