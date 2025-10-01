#!/bin/bash

# FlexiPOS Local Development Setup Script
echo "🚀 Setting up FlexiPOS for local development..."

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if local Supabase is running
echo "🔍 Checking if local Supabase is running..."
if curl -f http://localhost:54321/health &> /dev/null; then
    echo "✅ Local Supabase is running on http://localhost:54321"
else
    echo "⚠️ Local Supabase is not running on port 54321"
    echo "Please make sure your Supabase Docker container is running with the correct port mappings:"
    echo "docker run -p 54321:8000 -p 54322:5432 ..."
    echo "Or use 'supabase start' if you have the Supabase CLI"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate types from local Supabase
echo "🔧 Generating TypeScript types from local Supabase..."
if command -v supabase &> /dev/null; then
    npm run gen:types
    echo "✅ Types generated successfully"
else
    echo "⚠️ Supabase CLI not found. Install it with: npm install -g supabase"
    echo "Then run: npm run gen:types"
fi

echo "🎉 Setup complete! You can now run:"
echo "npm run dev"