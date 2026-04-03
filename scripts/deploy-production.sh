#!/bin/bash
set -e
echo "🚀 Deploying PlayNode to PRODUCTION..."

# Confirmation prompt
read -p "⚠️  Are you sure you want to deploy to PRODUCTION? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
  echo "❌ Production deployment cancelled."
  exit 0
fi

# Check Railway CLI
if ! command -v railway &> /dev/null; then
  echo "Installing Railway CLI..."
  npm i -g @railway/cli
fi

# Deploy frontend
echo "📦 Deploying frontend to production..."
cd packages/frontend
railway up --service frontend --environment production
cd ../..

# Deploy indexer
echo "📦 Deploying indexer to production..."
cd packages/indexer
railway up --service indexer --environment production
cd ../..

echo "✅ Production deployment complete!"
