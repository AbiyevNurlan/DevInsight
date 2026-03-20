@echo off
echo 🚀 DevInsight Frontend Setup
echo ================================

REM Check if we're in the frontend directory
if not exist package.json (
    echo ❌ Error: package.json not found. Please run this script from the devInsight-frontend directory.
    pause
    exit /b 1
)

echo 📦 Installing dependencies...
call npm install

if %errorlevel% neq 0 (
    echo ❌ Error: npm install failed
    pause
    exit /b 1
)

echo.
echo ✅ Setup complete!
echo.
echo 🔧 To start the development server:
echo    npm run dev
echo.
echo 🌐 The app will be available at:
echo    http://localhost:5173
echo.
echo 📋 Environment Variables (if needed):
echo    VITE_API_BASE=http://localhost:8080/api
echo.
pause