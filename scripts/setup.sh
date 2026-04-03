#!/bin/bash
set -e
echo "🔧 Setting up PlayNode development environment..."

# Check Node.js version
REQUIRED_NODE_MAJOR=22
CURRENT_NODE_MAJOR=$(node -v | cut -d'.' -f1 | tr -d 'v')

if [ "$CURRENT_NODE_MAJOR" -lt "$REQUIRED_NODE_MAJOR" ]; then
  echo "❌ Node.js $REQUIRED_NODE_MAJOR+ is required. Current version: $(node -v)"
  echo "   Install via: nvm install $REQUIRED_NODE_MAJOR"
  exit 1
fi
echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy .env.example to .env if not exists
if [ -f packages/indexer/.env.example ] && [ ! -f packages/indexer/.env ]; then
  cp packages/indexer/.env.example packages/indexer/.env
  echo "✅ Created packages/indexer/.env from .env.example"
fi

if [ -f packages/frontend/.env.example ] && [ ! -f packages/frontend/.env ]; then
  cp packages/frontend/.env.example packages/frontend/.env
  echo "✅ Created packages/frontend/.env from .env.example"
fi

if [ -f .env.example ] && [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ Created .env from .env.example"
fi

# Generate Prisma client
echo "🗄️  Generating Prisma client..."
cd packages/indexer
npx prisma generate
cd ../..

echo ""
echo "✅ PlayNode setup complete!"
echo ""
echo "Next steps:"
echo "  npm run dev        — Start frontend dev server"
echo "  npm run dev:all    — Start all services"
