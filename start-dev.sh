#!/bin/bash
# Quick setup script for FlexiPOS development with Docker Supabase

echo "🚀 FlexiPOS Quick Setup with Docker Supabase"
echo "============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the FlexiPOS project root directory"
    exit 1
fi

# Start Supabase services
echo "📦 Starting Supabase services..."
./supabase-docker.sh start

# Wait a moment for services to stabilize
echo "⏳ Waiting for services to stabilize..."
sleep 5

# Generate types
echo "🔧 Generating TypeScript types..."
./supabase-docker.sh types

# Start the development server
echo "🎯 Starting Next.js development server..."
echo "Your app will be available at: http://localhost:3000"
echo "Supabase Studio will be available at: http://localhost:54323"
echo ""
echo "Press Ctrl+C to stop all services"

# Start the Next.js app
npm run dev