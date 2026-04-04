# PlayNode — CLAUDE.md

## Quick Reference
- **Project:** Consumer-first Game Content Platform on Sui (YouTube for game guides)
- **Stack:** Next.js 16 + React 19 + TailwindCSS v4 | Move on Sui | Express + Prisma + PostgreSQL
- **Deploy:** Railway (auto-deploy via `railway up`)
- **Currency:** USDC only (no custom token)
- **UX Model:** YouTube-style — content feed home, sidebar navigation, Creator Studio separated

## Live URLs
- **Frontend:** https://frontend-production-ffda.up.railway.app
- **Indexer:** https://indexer-production-87da.up.railway.app
- **GitHub:** https://github.com/axellee8065/playnode
- **Sui Testnet Package:** `0xc95c88dd38f337be32b012ec7729b86694bd69e6ba37cbbf0dafd657f97b78a7`

## Commands
- `npm run dev` — Start frontend dev server
- `npm run dev:indexer` — Start indexer dev server  
- `npm run dev:all` — Start both concurrently
- `npm run build` — Build frontend
- `npm run build:all` — Build all packages
- `railway up` — Deploy to Railway

## Architecture
- `packages/frontend/` — Next.js 16 App Router (18 routes)
- `packages/indexer/` — Express + Prisma event indexer + REST API
- `packages/contracts/` — Move smart contracts on Sui (10 modules)

## UX Architecture
- **Consumer pages:** Home feed, /drops, /reviews, /drop/[id], /review/[id], /node/[id], /game/[slug], /search, /shop, /quest, /grid-market, /settings
- **Creator Studio:** /studio (revenue), /studio/content (management) — accessed via avatar dropdown
- **Content creation:** /drops/create, /reviews/create
- **Layout:** Header (centered search) + Sidebar (consumer browse) + CategoryBar (game filters)
- **ContentCard:** Universal thumbnail card used across all list/grid views

## Key Rules
- NEVER use blockchain jargon in UI (no "token", "on-chain", "Web3", "NFT", "mint")
- Use gamer vocabulary: Drop, Review, Shop, Grid, Wire, Ping, Link, Quest, Rank
- UI language: English (all user-facing text)
- Consumer-first: content discovery is the default experience
- Creator tools hidden behind /studio (like YouTube Studio)
- Dark theme ONLY
- USDC amounts in JetBrains Mono font, green color (#00FF88)
- All revenue in USDC (6 decimals)

## Brand Colors
- Primary: #00FF88 (Node Green)
- Background: #0A0A0B
- Surface: #17171C  
- Features: Cyan #00D4FF, Purple #8B5CF6, Amber #FFB800, Red #FF4757, Blue #3B82F6

## Railway Services
- **frontend:** Next.js app (Dockerfile, port 3000)
- **indexer:** Express API (Dockerfile, port 4000)
- **Postgres:** Railway managed PostgreSQL
