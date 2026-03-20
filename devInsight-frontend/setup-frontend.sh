#!/bin/bash

echo "🚀 DevInsight Frontend Setup"
echo "================================"

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the devInsight-frontend directory."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "🔧 To start the development server:"
echo "   npm run dev"
echo ""
echo "🌐 The app will be available at:"
echo "   http://localhost:5173"
echo ""
echo "📋 Environment Variables (if needed):"
echo "   VITE_API_BASE=http://localhost:8080/api"
echo ""