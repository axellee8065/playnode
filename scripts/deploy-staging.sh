#!/bin/bash
set -e
echo "🚀 Deploying PlayNode to staging..."

# Check Railway CLI
if ! command -v railway &> /dev/null; then
  echo "Installing Railway CLI..."
  npm i -g @railway/cli
fi

# Deploy frontend
echo "📦 Deploying frontend..."
cd packages/frontend
railway up --service frontend
cd ../..

# Deploy indexer
echo "📦 Deploying indexer..."
cd packages/indexer
railway up --service indexer
cd ../..

echo "✅ Staging deployment complete!"
