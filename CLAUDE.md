# PlayNode — CLAUDE.md

## Quick Reference
- **Project:** Game Creator Economy Platform on Sui
- **Stack:** Next.js 15 + React 19 + TailwindCSS | Move on Sui | Express + Prisma + PostgreSQL
- **Deploy:** Railway (auto-deploy on push to main)
- **Currency:** USDC only (no custom token)

## Commands
- `npm run dev` — Start frontend dev server
- `npm run dev:indexer` — Start indexer dev server  
- `npm run dev:all` — Start both concurrently
- `npm run build` — Build frontend
- `npm run build:all` — Build all packages
- `npm run deploy:staging` — Deploy to Railway staging
- `npm run deploy:production` — Deploy to Railway production

## Architecture
- `packages/frontend/` — Next.js 15 App Router
- `packages/indexer/` — Express + Prisma event indexer
- `packages/contracts/` — Move smart contracts on Sui

## Key Rules
- NEVER use blockchain jargon in UI (no "token", "on-chain", "Web3", "NFT", "mint")
- Use gamer vocabulary: Drop, Review, Shop, Grid, Wire, Ping, Link, Quest, Rank
- Dark theme ONLY
- USDC amounts in JetBrains Mono font, green color
- All revenue in USDC (6 decimals)
- Railway CLI for deployment
- Auto-commit to GitHub on significant changes

## Brand Colors
- Primary: #00FF88 (Node Green)
- Background: #0A0A0B
- Surface: #17171C  
- Features: Cyan #00D4FF, Purple #8B5CF6, Amber #FFB800, Red #FF4757, Blue #3B82F6

## Railway Services
- frontend: Next.js app (port 3000)
- indexer: Express API (port 4000)
- database: PostgreSQL
