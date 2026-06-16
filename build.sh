#!/bin/bash
set -e

echo "🔨 Building ecerti project for Vercel..."

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
npm run build
cd ..

echo "✅ Build completed successfully!"
