# PlayNode — PRD.md
## Game Curator Economy Platform on Sui
### Version 3.0 | April 2026

---

## Project Overview

PlayNode is a consumer-first game content platform where guides, reviews, and recommendations generate USDC revenue for game curators — built on the Sui blockchain.

**One-liner:** Find the best game guides and reviews. Game Curators earn USDC.

**Core Thesis:** Build a YouTube-style discovery experience for game content, where the audience comes first and game curators are empowered with transparent, instant revenue. No custom token — USDC only.

**UX Philosophy:** Consumer-first. Content is king. Curator tools are hidden behind a separate Studio interface, just like YouTube separates YouTube from YouTube Studio.

---

## Tech Stack

```
Frontend:
  - Next.js 16 (App Router, Turbopack)
  - React 19
  - TypeScript
  - TailwindCSS v4 (@theme CSS variables)
  - Framer Motion (animations)
  - @mysten/sui (Sui SDK)
  - @wallet-standard/core (wallet detection)
  - Custom SuiProvider (no @mysten/dapp-kit — removed due to SES lockdown conflicts)
  - PWA enabled

Smart Contracts:
  - Move on Sui
  - Sui Framework (object, coin, clock, kiosk, transfer_policy, dynamic_field)
  - USDC: 0x...::usdc::USDC (Sui native Circle USDC, decimals=6)

Storage:
  - Walrus (decentralized blob storage for content)
  - On-chain (metadata, ownership, hashes, revenue records)

Infrastructure:
  - Sui Full Node (RPC)
  - Custom Indexer (PostgreSQL + event listener)
  - Sui Indexer (transaction tracking)
  - CDN (Cloudflare for static assets)

External APIs:
  - Steam Web API (playtime verification)
  - Riot API (playtime verification)
  - Circle USDC API (on/off ramp)
  - Affiliate Partner APIs (Steam/Epic/Humble store links)
  - Google AdSense / Kakao AdFit (Tier 2 programmatic ads)
```

---

## Directory Structure

```
playnode/
├── .github/
│   └── workflows/
│       └── ci.yml                 # GitHub Actions CI (lint, build, test)
├── scripts/
│   ├── deploy-staging.sh          # One-command staging deploy
│   ├── deploy-production.sh       # One-command production deploy
│   └── setup.sh                   # Initial project setup
├── CLAUDE.md                    # This file — project master doc
├── PRD.md                       # Product Requirements (this file)
├── BRAND.md                     # Brand identity reference
├── railway.toml                 # Root Railway config
├── .gitignore
├── .env.example                 # Environment template (no secrets)
│
├── packages/
│   ├── frontend/                # Next.js app
│   │   ├── railway.toml         # Frontend Railway service config
│   │   ├── Dockerfile           # Multi-stage Docker build for Railway
│   │   ├── src/
│   │   │   ├── app/             # App Router pages (18 routes)
│   │   │   │   ├── page.tsx                    # Home — content feed (YouTube-style)
│   │   │   │   ├── drops/page.tsx              # Guides listing with category filters
│   │   │   │   ├── drops/create/page.tsx       # Create Drop form
│   │   │   │   ├── reviews/page.tsx            # Reviews listing with rating filters
│   │   │   │   ├── reviews/create/page.tsx     # Create Review form
│   │   │   │   ├── drop/[id]/page.tsx          # Drop detail (video-page style)
│   │   │   │   ├── review/[id]/page.tsx        # Review detail
│   │   │   │   ├── node/[id]/page.tsx          # Curator channel (YouTube channel-style)
│   │   │   │   ├── game/[slug]/page.tsx        # Game hub with tabs
│   │   │   │   ├── grid-market/page.tsx        # Pixel Grid marketplace
│   │   │   │   ├── quest/page.tsx              # Quest/bounty board
│   │   │   │   ├── shop/page.tsx               # Game shop with affiliate links
│   │   │   │   ├── search/page.tsx             # Search results (guides/reviews/curators)
│   │   │   │   ├── settings/page.tsx           # User settings
│   │   │   │   ├── studio/page.tsx             # Curator Studio — revenue overview
│   │   │   │   ├── studio/content/page.tsx     # Curator Studio — content management
│   │   │   │   └── dashboard/page.tsx          # Redirect → /studio
│   │   │   ├── components/
│   │   │   │   ├── layout/      # Header (YouTube-style), Sidebar (consumer), CategoryBar, UserMenu
│   │   │   │   ├── feed/        # ContentCard (universal thumbnail card), ContentFeed
│   │   │   │   ├── providers/   # SuiProvider (wallet context), ClientProviders
│   │   │   │   └── common/      # Badge, Button, Card, Logo, UsdcAmount, StatCard
│   │   │   ├── hooks/           # Custom React hooks
│   │   │   │   ├── useSui.ts    # Sui transaction helper (usePlayNode)
│   │   │   │   ├── useNode.ts   # Node on-chain operations
│   │   │   │   ├── useDrop.ts   # Drop on-chain operations
│   │   │   │   └── useApi.ts    # Generic data fetching hook
│   │   │   ├── lib/             # Utilities
│   │   │   │   ├── sui.ts       # Sui client config (testnet/mainnet)
│   │   │   │   ├── api.ts       # Indexer API client with typed interfaces
│   │   │   │   ├── games.ts     # Game categories + content type definitions
│   │   │   │   └── constants.ts # Brand constants, feature definitions
│   │   │   └── styles/
│   │   │       └── globals.css  # TailwindCSS v4 @theme variables
│   │   ├── public/
│   │   ├── next.config.ts
│   │   ├── postcss.config.mjs
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── contracts/               # Move smart contracts
│   │   ├── sources/
│   │   │   ├── node.move
│   │   │   ├── drop.move
│   │   │   ├── review.move
│   │   │   ├── shop.move
│   │   │   ├── pixel_grid.move
│   │   │   ├── revenue.move
│   │   │   ├── subscription.move
│   │   │   ├── quest.move
│   │   │   ├── rank.move
│   │   │   └── verify.move
│   │   ├── tests/
│   │   │   ├── node_tests.move
│   │   │   ├── drop_tests.move
│   │   │   ├── revenue_tests.move
│   │   │   └── pixel_grid_tests.move
│   │   └── Move.toml
│   │
│   └── indexer/                 # Custom event indexer
│       ├── railway.toml         # Indexer Railway service config
│       ├── src/
│       │   ├── index.ts
│       │   ├── events.ts
│       │   ├── db.ts
│       │   └── api.ts
│       ├── prisma/
│       │   └── schema.prisma
│       └── package.json
│
└── docs/
    ├── PRD.md
    ├── BRAND.md
    └── brand-identity.html
```

---

## Data Model — Move Objects

### Node (Curator Home)

```move
module playnode::node {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::TxContext;
    use sui::dynamic_field;
    use std::string::String;

    struct Node has key {
        id: UID,
        owner: address,
        display_name: String,
        bio: String,
        avatar_url: String,
        banner_url: String,
        rank: u8,              // Bronze=1, Silver=2, Gold=3, Diamond=4, Master=5
        reputation: u64,
        total_drops: u64,
        total_reviews: u64,
        total_views: u64,
        total_earned: u64,     // Cumulative USDC (6 decimals)
        created_at: u64,
    }

    // GameProfile stored as Dynamic Field on Node
    struct GameProfile has store, drop {
        platform: String,      // "steam", "riot", "xbox"
        username: String,
        verified: bool,
        verification_hash: vector<u8>,
        verified_at: u64,
    }
}
```

### Drop (Guide/Walkthrough)

```move
module playnode::drop {
    struct Drop has key {
        id: UID,
        node_id: ID,
        author: address,
        title: String,
        content_hash: vector<u8>,    // SHA-256 of content
        walrus_blob_id: String,       // Walrus storage reference
        category: u8,                 // 0=boss, 1=build, 2=quest, 3=tier_list, 4=speedrun, 5=general
        game_tag: String,             // e.g. "monster_hunter_wilds"
        price: u64,                   // 0 = free, >0 = USDC price (6 decimals)
        is_premium: bool,
        total_views: u64,
        total_purchases: u64,
        total_earned: u64,
        created_at: u64,
        updated_at: u64,
        version: u64,
        parent_drop: Option<ID>,      // For derivative guides
    }

    // Dynamic Fields on Drop:
    // - PatchUpdate { patch_version, content_hash, walrus_blob_id, author, created_at }
    // - Translation { language, content_hash, walrus_blob_id, translator, created_at }
    // - CommunityTip { author, content, helpful_count, created_at }
    // - ShopLink (reference to ShopLink object)
    // - PixelGrid (reference to PixelGrid object)
    // - PurchaseRecord { buyer, price_paid, purchased_at }
}
```

### Review (Verified Game Review)

```move
module playnode::review {
    struct Review has key {
        id: UID,
        node_id: ID,
        author: address,
        game_tag: String,
        rating: u8,                      // 1~100, displayed as 0.1~10.0
        category_ratings: vector<u8>,    // [story, graphics, combat, endgame, value]
        content_hash: vector<u8>,
        walrus_blob_id: String,
        verified_playtime_hours: u64,
        verification_level: u8,          // 0=Unverified, 1=Verified(10h+), 2=Experienced(50h+), 3=Expert(200h+), 4=Master(500h+)
        verification_hash: vector<u8>,   // Hash of API response
        helpful_count: u64,
        total_views: u64,
        total_earned: u64,
        created_at: u64,
    }
}
```

### ShopLink (Affiliate)

```move
module playnode::shop {
    struct ShopLink has key, store {
        id: UID,
        node_id: ID,
        creator: address,
        game_id: String,
        game_title: String,
        store: u8,                       // 0=Steam, 1=Epic, 2=Humble, 3=Direct
        affiliate_url: String,
        commission_rate_bps: u64,        // Basis points (500 = 5%)
        total_clicks: u64,
        total_conversions: u64,
        total_earned: u64,
    }

    struct CuratedBundle has key {
        id: UID,
        creator: address,
        title: String,
        description: String,
        games: vector<ID>,              // ShopLink IDs
        bundle_discount_bps: u64,
        total_sales: u64,
        total_earned: u64,
        created_at: u64,
    }
}
```

### PixelGrid & PixelBlock

```move
module playnode::pixel_grid {
    struct PixelGrid has key {
        id: UID,
        parent_type: u8,        // 0=Node, 1=Drop, 2=Review, 3=Game
        parent_id: ID,
        width: u8,              // Default 20
        height: u8,             // Default 10
        total_pixels: u16,      // 200
        sold_pixels: u16,
        base_price: u64,        // USDC (6 decimals), recalculated monthly
        monthly_views: u64,
        total_revenue: u64,
    }

    struct PixelBlock has key, store {
        id: UID,
        grid_id: ID,
        owner: address,          // Advertiser
        x: u8,
        y: u8,
        width: u8,
        height: u8,
        pixel_count: u16,
        image_url: String,       // Ad image (Walrus or CDN)
        link_url: String,        // Click destination
        price_paid: u64,         // USDC amount
        expires_at: u64,         // Epoch ms timestamp
        auto_renew: bool,
        deposit: u64,            // Quality guarantee deposit
        status: u8,              // 0=Active, 1=Expiring, 2=Auction, 3=Vacant
        created_at: u64,
    }
}
```

### Revenue Router

```move
module playnode::revenue {
    use sui::coin::{Self, Coin};
    use sui::transfer;

    // USDC type alias (actual path depends on deployment)
    // use 0x...::usdc::USDC;

    struct RevenueConfig has key {
        id: UID,
        protocol_treasury: address,
        // Split rates stored as basis points (10000 = 100%)
        premium_drop_creator_bps: u64,      // 8000 = 80%
        premium_drop_protocol_bps: u64,     // 1500 = 15%
        premium_drop_referral_bps: u64,     // 500 = 5%
        pixel_grid_creator_bps: u64,        // 5500 = 55%
        pixel_grid_protocol_bps: u64,       // 2500 = 25%
        pixel_grid_referral_bps: u64,       // 1500 = 15%
        pixel_grid_curator_bps: u64,        // 500 = 5%
        shop_creator_bps: u64,              // 7000 = 70%
        shop_protocol_bps: u64,             // 2000 = 20%
        shop_referral_bps: u64,             // 1000 = 10%
        quest_creator_bps: u64,             // 9000 = 90%
        quest_protocol_bps: u64,            // 1000 = 10%
    }

    // All revenue splits happen in a single Programmable Transaction Block
    // Example: purchase_drop splits USDC into creator/protocol/referral in one atomic tx
}
```

### Subscription (Link)

```move
module playnode::subscription {
    struct LinkPass has key {
        id: UID,
        subscriber: address,
        node_id: ID,             // Subscribed creator
        price_per_month: u64,    // USDC
        started_at: u64,
        expires_at: u64,
        auto_renew: bool,
    }
}
```

### Quest (Bounty)

```move
module playnode::quest {
    struct Quest has key {
        id: UID,
        creator: address,        // Quest issuer (publisher or user)
        title: String,
        description: String,
        game_tag: String,
        reward_amount: u64,      // USDC escrowed
        escrow_balance: u64,     // Remaining USDC in escrow
        min_rank: u8,            // Minimum creator rank to accept
        deadline: u64,
        status: u8,              // 0=Open, 1=InProgress, 2=Review, 3=Completed, 4=Cancelled
        assigned_to: Option<address>,
        result_drop_id: Option<ID>,
        created_at: u64,
    }
}
```

### Rank (Soulbound)

```move
module playnode::rank {
    // No `store` ability = non-transferable (soulbound)
    struct Rank has key {
        id: UID,
        owner: address,
        level: u8,               // 1=Bronze, 2=Silver, 3=Gold, 4=Diamond, 5=Master
        total_drops: u64,
        total_reviews: u64,
        total_views: u64,
        total_links: u64,
        reputation: u64,
        last_updated: u64,
    }

    // Rank thresholds:
    // Bronze: signup
    // Silver: 10+ drops OR 5+ reviews, 10K+ views
    // Gold: 30+ content, 100K+ views
    // Diamond: 50+ content, 500K+ views, 500+ links
    // Master: top 1% + community vote
}
```

---

## Pixel Grid Dynamic Pricing

```typescript
// packages/frontend/src/lib/pricing.ts

interface PriceParams {
  monthlyPageViews: number;
  gridOccupancyPercent: number;
  positionY: number;        // 0 = top, max = bottom
  gridHeight: number;
}

function calculatePixelPrice(params: PriceParams): number {
  const base = getBasePrice(params.monthlyPageViews);
  const scarcity = getScarcityMultiplier(params.gridOccupancyPercent);
  const position = getPositionMultiplier(params.positionY, params.gridHeight);
  return base * scarcity * position;
}

function getBasePrice(pv: number): number {
  if (pv < 1000) return 0.10;
  if (pv < 10000) return 0.50;
  if (pv < 50000) return 2.00;
  if (pv < 100000) return 5.00;
  if (pv < 500000) return 15.00;
  return 30.00;
}

function getScarcityMultiplier(occupancy: number): number {
  if (occupancy < 30) return 1.0;
  if (occupancy < 60) return 1.5;
  if (occupancy < 80) return 2.0;
  if (occupancy < 95) return 3.0;
  return 5.0;
}

function getPositionMultiplier(y: number, height: number): number {
  const ratio = y / height;
  if (ratio < 0.33) return 2.0;   // Top third
  if (ratio < 0.66) return 1.0;   // Middle third
  return 0.7;                      // Bottom third
}
```

### Pixel Lifecycle

```
Day 1:   Advertiser pays USDC → PixelBlock object created (30 days)
Day 25:  Expiry warning (5 days)
Day 30:  Expiry
  ├── auto_renew=true → charge current market price (10% loyalty discount)
  └── auto_renew=false or payment failed
      → status=Auction (3 days)
      → Minimum bid = 80% of current market price
      → Highest bidder wins after 3 days
      → No bids → status=Vacant (instant purchase available)
```

---

## Revenue Distribution

### Split Rates (basis points, 10000 = 100%)

| Source | Creator | Protocol | Referral | Curator |
|--------|---------|----------|----------|---------|
| Premium Drop | 8000 | 1500 | 500 | — |
| Free Drop (ad) | 5000 | 5000 | — | — |
| Link subscription | 10000 | 0 | — | — |
| Ping tip | 10000 | 0 | — | — |
| Pixel Grid | 5500 | 2500 | 1500 | 500 |
| Shop affiliate | 7000 | 2000 | 1000 | — |
| Quest bounty | 9000 | 1000 | — | — |
| Programmatic ad | 5000 | 5000 | — | — |

### Revenue Router Flow

```
USDC Payment
  → revenue.move::distribute()
  → Single Programmable Transaction Block:
     ├── coin::split() → creator_share → transfer to creator wallet
     ├── coin::split() → protocol_share → transfer to treasury
     ├── coin::split() → referral_share → transfer to referrer (if exists)
     └── remaining → curator_share → transfer to curator (if exists)
  → Emit RevenueEvent { source, amount, creator, timestamp }
```

---

## Rank System

| Level | Value | Requirements | Privileges |
|-------|-------|-------------|------------|
| Bronze | 1 | Signup | Basic Drop/Review |
| Silver | 2 | 10+ Drops OR 5+ Reviews, 10K+ views | Premium pricing, Series |
| Gold | 3 | 30+ content, 100K+ views | Quest eligible, Curator |
| Diamond | 4 | 50+ content, 500K+ views, 500+ Links | Quest priority, Grid activation |
| Master | 5 | Top 1% + vote | Governance, Publisher partnerships |

Rank object has `key` only (no `store`) = soulbound, non-transferable.

---

## Playtime Verification

```typescript
// packages/frontend/src/lib/verify.ts

interface VerificationResult {
  platform: 'steam' | 'riot' | 'xbox';
  gameId: string;
  playtimeHours: number;
  level: VerificationLevel;
  hash: string;  // SHA-256 of API response for on-chain storage
}

enum VerificationLevel {
  Unverified = 0,   // No API connection
  Verified = 1,     // 10+ hours
  Experienced = 2,  // 50+ hours
  Expert = 3,       // 200+ hours
  Master = 4,       // 500+ hours
}

// Steam Web API:
// GET https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/
// ?key={API_KEY}&steamid={STEAM_ID}&include_played_free_games=true

// Response includes playtime_forever (minutes) per game
```

---

## 2-Tier Ad System

```
Tier 1: Pixel Grid (top 10% pages, PV >= 1,000)
  - Advertisers buy pixels with USDC directly
  - Dynamic pricing per formula above
  - RPM equivalent: $30~$100+
  - On-chain settlement, instant

Tier 2: Programmatic (bottom 90% pages, PV < 1,000)
  - Google AdSense / Kakao AdFit auto-inserted
  - Standard banner positions
  - RPM: $3~$8
  - Monthly USDC conversion → on-chain distribution
```

---

## Token Strategy

**Phase 1~2: No token. USDC only.**

Activity points tracked off-chain in indexer database for future distribution.

**Phase 3: Token launch gate (ALL conditions required):**
- Monthly revenue >= $100,000 USDC for 3 consecutive months
- MAU >= 50,000
- Active game curators >= 1,000
- Publisher partnerships >= 3
- Community vote >= 70% approval

**Token utility (if launched):**
- Governance (reward pool distribution votes per game)
- Fee discount (10% off premium purchases for holders)
- Rank staking (Master rank requirement)
- Revenue share (protocol treasury profit distribution)
- Cosmetics (profile customization)

**Rule: USDC payments are NEVER replaced by token.**

---

## Frontend Routes

### Consumer Pages (public browsing)

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home Feed | YouTube-style content feed — trending drops & reviews, game category filter |
| `/drops` | Guide Listings | All guides with category/sort filters, ContentCard grid |
| `/reviews` | Review Listings | All reviews with rating/verification filters |
| `/drop/[id]` | Drop Detail | Guide content (video-page layout), curator bar, related content sidebar |
| `/review/[id]` | Review Detail | Review with ratings, verification badge, curator bar |
| `/node/[id]` | Curator Channel | YouTube channel-style — banner, tabs (Content/Reviews/About), Subscribe |
| `/game/[slug]` | Game Hub | All content for a game, category filters, shop links |
| `/grid-market` | Grid Market | Browse Pixel Grids, purchase pixels |
| `/quest` | Quest Board | Open bounties, accept & track |
| `/shop` | Game Shop | Featured bundles, trending games, curator-curated recommendations |
| `/search` | Search Results | Full-text search across guides, reviews, game curators, games |
| `/settings` | User Settings | Profile, wallets, game profiles, notifications |

### Curator Studio (authenticated, separate UX)

| Route | Page | Description |
|-------|------|-------------|
| `/studio` | Studio Overview | Revenue analytics, weekly chart, quick actions |
| `/studio/content` | Content Management | Table of curator's content with search/filter/edit |
| `/dashboard` | (Redirect) | Redirects to `/studio` |

### Content Creation

| Route | Page | Description |
|-------|------|-------------|
| `/drops/create` | Create Drop | Guide creation form with category, pricing, preview |
| `/reviews/create` | Create Review | Review form with 5-category ratings, playtime verification |

### UX Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ Header: [Logo] [========Search========] [+Create] [Avatar▼] │
├─────────────────────────────────────────────────────────────┤
│ CategoryBar: [All] [Monster Hunter] [Elden Ring] [FF7] ...  │
├────────────┬────────────────────────────────────────────────┤
│  Sidebar   │  Main Content                                  │
│  ────────  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐             │
│  Home      │  │Card │ │Card │ │Card │ │Card │             │
│  Trending  │  └─────┘ └─────┘ └─────┘ └─────┘             │
│  Games ▼   │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐             │
│  ────────  │  │Card │ │Card │ │Card │ │Card │             │
│  Guides    │  └─────┘ └─────┘ └─────┘ └─────┘             │
│  Reviews   │                                                │
│  Shop      │  ContentCard = universal thumbnail card         │
│  Quests    │  (game badge, price, author, views, rating)    │
│  Grid Mkt  │                                                │
└────────────┴────────────────────────────────────────────────┘

Consumer UX: YouTube-style content discovery (sidebar + feed)
Curator UX: /studio (separate, accessed via avatar menu)
```

---

## Design System (CSS Variables)

```css
:root {
  /* Core */
  --pn-black: #0A0A0B;
  --pn-dark: #111113;
  --pn-surface: #17171C;
  --pn-surface-2: #1F1F26;
  --pn-surface-3: #27272F;
  --pn-border: #2A2A32;
  --pn-muted: #6B6B7B;
  --pn-text: #CDCDD6;
  --pn-white: #F5F5F7;

  /* Brand */
  --pn-green: #00FF88;          /* Primary, CTA, revenue, USDC */
  --pn-green-dim: #00CC6A;
  --pn-green-glow: rgba(0,255,136,0.12);
  --pn-cyan: #00D4FF;           /* Reviews, info, views */
  --pn-purple: #8B5CF6;         /* Pixel Grid, premium */
  --pn-amber: #FFB800;          /* Shop, quests, commissions */
  --pn-red: #FF4757;            /* Community, ping, alerts */
  --pn-blue: #3B82F6;           /* Rank, verification */

  /* Typography */
  --font-primary: 'Outfit', 'Noto Sans KR', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --font-kr: 'Noto Sans KR', sans-serif;

  /* Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
}
```

---

## API Endpoints (Indexer)

```
GET    /api/nodes                    # List nodes (paginated, filterable)
GET    /api/nodes/:id                # Get node detail
GET    /api/nodes/:id/drops          # Get node's drops
GET    /api/nodes/:id/reviews        # Get node's reviews
GET    /api/nodes/:id/revenue        # Get node revenue breakdown
GET    /api/drops                    # List drops (paginated, filterable by game)
GET    /api/drops/:id                # Get drop detail
POST   /api/drops/:id/view          # Record view (for ad revenue)
GET    /api/reviews                  # List reviews (filterable by game)
GET    /api/reviews/:id              # Get review detail
GET    /api/games                    # List games
GET    /api/games/:slug              # Get game hub data
GET    /api/games/:slug/drops        # Get game's drops
GET    /api/games/:slug/reviews      # Get game's reviews
GET    /api/grids                    # List pixel grids with availability
GET    /api/grids/:id                # Get grid detail with blocks
GET    /api/grids/:id/price          # Calculate current pixel price
GET    /api/quests                   # List open quests
GET    /api/quests/:id               # Get quest detail
GET    /api/shop/links/:nodeId       # Get creator's shop links
GET    /api/shop/bundles             # List curated bundles
GET    /api/revenue/:address         # Get revenue history for address
GET    /api/search?q=               # Full-text search across drops/reviews/games
```

---

## Indexer Schema (Prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Node {
  id            String   @id                // Sui Object ID
  owner         String                      // Sui address
  displayName   String
  bio           String?
  avatarUrl     String?
  bannerUrl     String?
  rank          Int      @default(1)
  reputation    Int      @default(0)
  totalDrops    Int      @default(0)
  totalReviews  Int      @default(0)
  totalViews    BigInt   @default(0)
  totalEarned   BigInt   @default(0)        // USDC in smallest unit
  createdAt     DateTime
  updatedAt     DateTime @updatedAt

  drops         Drop[]
  reviews       Review[]
  shopLinks     ShopLink[]
  subscribers   Subscription[]
  pixelGrid     PixelGrid?
  gameProfiles  GameProfile[]

  @@index([owner])
  @@index([rank])
  @@index([totalViews])
}

model Drop {
  id              String   @id
  nodeId          String
  node            Node     @relation(fields: [nodeId], references: [id])
  author          String
  title           String
  contentHash     String
  walrusBlobId    String
  category        Int
  gameTag         String
  price           BigInt   @default(0)
  isPremium       Boolean  @default(false)
  totalViews      BigInt   @default(0)
  totalPurchases  Int      @default(0)
  totalEarned     BigInt   @default(0)
  version         Int      @default(1)
  parentDropId    String?
  createdAt       DateTime
  updatedAt       DateTime @updatedAt

  pixelGrid       PixelGrid?
  shopLinks       ShopLink[]
  purchases       Purchase[]

  @@index([gameTag])
  @@index([author])
  @@index([totalViews])
  @@fulltext([title])
}

model Review {
  id                    String   @id
  nodeId                String
  node                  Node     @relation(fields: [nodeId], references: [id])
  author                String
  gameTag               String
  rating                Int                 // 1~100
  categoryRatings       Json                // [story, graphics, combat, endgame, value]
  contentHash           String
  walrusBlobId          String
  verifiedPlaytimeHours Int      @default(0)
  verificationLevel     Int      @default(0)
  verificationHash      String?
  helpfulCount          Int      @default(0)
  totalViews            BigInt   @default(0)
  totalEarned           BigInt   @default(0)
  createdAt             DateTime

  pixelGrid             PixelGrid?

  @@index([gameTag])
  @@index([verificationLevel])
  @@index([rating])
}

model ShopLink {
  id                String   @id
  nodeId            String
  node              Node     @relation(fields: [nodeId], references: [id])
  dropId            String?
  drop              Drop?    @relation(fields: [dropId], references: [id])
  creator           String
  gameId            String
  gameTitle         String
  store             Int               // 0=Steam, 1=Epic, 2=Humble, 3=Direct
  affiliateUrl      String
  commissionRateBps Int
  totalClicks       Int      @default(0)
  totalConversions  Int      @default(0)
  totalEarned       BigInt   @default(0)

  @@index([gameId])
  @@index([creator])
}

model PixelGrid {
  id             String   @id
  parentType     Int                  // 0=Node, 1=Drop, 2=Review, 3=Game
  parentId       String
  nodeId         String?  @unique
  node           Node?    @relation(fields: [nodeId], references: [id])
  dropId         String?  @unique
  drop           Drop?    @relation(fields: [dropId], references: [id])
  reviewId       String?  @unique
  review         Review?  @relation(fields: [reviewId], references: [id])
  width          Int      @default(20)
  height         Int      @default(10)
  totalPixels    Int      @default(200)
  soldPixels     Int      @default(0)
  basePrice      BigInt
  monthlyViews   BigInt   @default(0)
  totalRevenue   BigInt   @default(0)

  blocks         PixelBlock[]
}

model PixelBlock {
  id           String   @id
  gridId       String
  grid         PixelGrid @relation(fields: [gridId], references: [id])
  owner        String              // Advertiser address
  x            Int
  y            Int
  width        Int
  height       Int
  pixelCount   Int
  imageUrl     String
  linkUrl      String
  pricePaid    BigInt
  expiresAt    DateTime
  autoRenew    Boolean  @default(false)
  deposit      BigInt   @default(0)
  status       Int      @default(0) // 0=Active, 1=Expiring, 2=Auction, 3=Vacant
  createdAt    DateTime

  @@index([gridId])
  @@index([owner])
  @@index([expiresAt])
  @@index([status])
}

model Subscription {
  id             String   @id
  subscriber     String
  nodeId         String
  node           Node     @relation(fields: [nodeId], references: [id])
  pricePerMonth  BigInt
  startedAt      DateTime
  expiresAt      DateTime
  autoRenew      Boolean  @default(true)

  @@index([subscriber])
  @@index([nodeId])
  @@index([expiresAt])
}

model Quest {
  id             String   @id
  creator        String
  title          String
  description    String
  gameTag        String
  rewardAmount   BigInt
  escrowBalance  BigInt
  minRank        Int
  deadline       DateTime
  status         Int      @default(0)
  assignedTo     String?
  resultDropId   String?
  createdAt      DateTime

  @@index([gameTag])
  @@index([status])
}

model Purchase {
  id          String   @id @default(cuid())
  dropId      String
  drop        Drop     @relation(fields: [dropId], references: [id])
  buyer       String
  pricePaid   BigInt
  txDigest    String              // Sui transaction digest
  createdAt   DateTime @default(now())

  @@index([dropId])
  @@index([buyer])
}

model RevenueEvent {
  id          String   @id @default(cuid())
  source      String              // "drop", "grid", "shop", "quest", "subscription", "ping", "ad"
  sourceId    String              // Object ID of source
  amount      BigInt              // Total USDC
  creatorAddr String
  creatorAmt  BigInt
  protocolAmt BigInt
  referralAddr String?
  referralAmt  BigInt?
  txDigest    String
  createdAt   DateTime @default(now())

  @@index([creatorAddr])
  @@index([source])
  @@index([createdAt])
}

model PageView {
  id          String   @id @default(cuid())
  pageType    String              // "drop", "review", "node", "game"
  pageId      String
  viewerAddr  String?
  createdAt   DateTime @default(now())

  @@index([pageType, pageId])
  @@index([createdAt])
}
```

---

## Implementation Status

### Completed (v3.0)

**Infrastructure:**
- [x] Next.js 16 frontend with TailwindCSS v4 + Framer Motion
- [x] Express + Prisma indexer with PostgreSQL (12 tables, all seeded)
- [x] Move contracts: 10 modules deployed to Sui testnet
- [x] Package ID: `0xc95c88dd38f337be32b012ec7729b86694bd69e6ba37cbbf0dafd657f97b78a7`
- [x] Railway deployment (frontend + indexer + PostgreSQL)
- [x] GitHub Actions CI/CD pipeline
- [x] Wallet connection via @wallet-standard/core (Slush/Sui Wallet)

**Consumer UX (YouTube-style):**
- [x] Home page: content feed with game category filtering
- [x] ContentCard: universal thumbnail card for all list views
- [x] Header: centered search bar, Create button, UserMenu dropdown
- [x] Sidebar: consumer browse navigation (Home, Trending, Games, Guides, Reviews)
- [x] CategoryBar: horizontal scrollable game/content-type pills
- [x] 18 routes, all with consistent layout

**Curator Studio:**
- [x] /studio: revenue overview, weekly chart, revenue breakdown
- [x] /studio/content: content management table with search/filter
- [x] Separated from consumer experience (accessed via avatar menu)

**Content Creation:**
- [x] /drops/create: guide form with category, pricing, markdown, preview
- [x] /reviews/create: review form with 5-category ratings, playtime verification UI

**User Actions (UI wired, pending on-chain integration):**
- [x] Drop purchase button (wallet check + confirmation)
- [x] Quest accept (wallet check + confirmation)
- [x] Ping/tip (USDC amount prompt)
- [x] Link subscribe (subscription confirmation)
- [x] Helpful vote (local state + API fire-and-forget)
- [x] Shop affiliate links (real store URLs: Steam/Epic/PS/Xbox)
- [x] Grid advertise (wallet check + coming soon)
- [x] Wire withdrawal (wallet check + confirmation)

### Phase 1: MVP Remaining (Next)

**Sprint 1~2: Core Infrastructure**
- [ ] zkLogin integration (Google/Discord social login)
- [ ] Sponsored transaction setup (gas-free for users)
- [ ] Walrus content upload/fetch (guide text + images)

**Sprint 3~4: Monetization**
- [ ] Premium Drop purchase flow (on-chain USDC transaction)
- [ ] Ping (tip) on-chain transaction
- [ ] Revenue router: on-chain USDC splits (creator/protocol/referral)
- [ ] Wire withdrawal (USDC transfer to external wallet)
- [ ] Playtime verification via Steam/Riot API

**Sprint 5~6: Community & Polish**
- [ ] Link (subscription) on-chain recurring payments
- [ ] Helpful vote persistence (backend API)
- [ ] Quest accept/submit/approve flow (on-chain escrow)
- [ ] Loading states and error handling UI
- [ ] Mobile PWA optimization
- [ ] Curator onboarding flow (first Drop wizard)

### Phase 2: Growth (Month 4~6)

- [ ] Pixel Grid system (pixel_grid.move + frontend)
- [ ] Pixel auction mechanism
- [ ] Quest/bounty system
- [ ] Rank progression automation
- [ ] Curated bundles (Shop Phase 2)
- [ ] Multi-game expansion
- [ ] Publisher dashboard for Grid ads and Quests

### Phase 3: Scale (Month 7~12)

- [ ] Multi-language Drop support
- [ ] Translation layer (Dynamic Fields)
- [ ] English market expansion
- [ ] Advanced analytics dashboard
- [ ] API public access
- [ ] Embed widget for external sites
- [ ] Token launch assessment

---

## Environment Variables

```env
# Sui
SUI_NETWORK=mainnet|testnet|devnet
SUI_RPC_URL=https://fullnode.mainnet.sui.io
PACKAGE_ID=0x...
REVENUE_CONFIG_ID=0x...
USDC_TYPE=0x...::usdc::USDC

# Walrus
WALRUS_PUBLISHER_URL=https://publisher.walrus.site
WALRUS_AGGREGATOR_URL=https://aggregator.walrus.site

# Auth
GOOGLE_CLIENT_ID=
DISCORD_CLIENT_ID=

# External APIs
STEAM_API_KEY=
RIOT_API_KEY=

# Database
DATABASE_URL=postgresql://...

# Ads
ADSENSE_CLIENT_ID=
KAKAO_ADFIT_UNIT_ID=

# Circle
CIRCLE_API_KEY=

# Railway
RAILWAY_TOKEN=                    # railway login --token
RAILWAY_PROJECT_ID=
RAILWAY_ENVIRONMENT=production    # production | staging
```

---

## Deployment — GitHub + Railway

### Current Production

| Service | URL | Status |
|---------|-----|--------|
| Frontend | https://frontend-production-ffda.up.railway.app | Active |
| Indexer API | https://indexer-production-87da.up.railway.app | Active |
| PostgreSQL | postgres.railway.internal:5432 | Active |
| GitHub | https://github.com/axellee8065/playnode | Public |
| Sui Testnet | Package `0xc95c...78a7` | Deployed |

### Railway Services

- **frontend**: Next.js 16 (Dockerfile, port 3000)
- **indexer**: Express + Prisma (Dockerfile, port 4000)
- **Postgres**: Railway managed PostgreSQL

### Git & Deployment

```bash
# ─────────────────────────────────────────────
# 1. GitHub Repository
# ─────────────────────────────────────────────

# Already set up:
# gh repo create playnode --public --source=. --push

# .gitignore 설정
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnpm-store/

# Environment
.env
.env.local
.env.production
.env.*.local

# Build
.next/
out/
dist/
build/

# Sui
build/
.sui/

# Database
prisma/migrations/dev/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Railway
.railway/
EOF

# 초기 커밋
git add .
git commit -m "init: PlayNode project setup"
git push -u origin main
```

```bash
# ─────────────────────────────────────────────
# 2. 브랜치 전략
# ─────────────────────────────────────────────

# main     → production (Railway auto-deploy)
# staging  → staging environment
# dev      → 개발 작업 브랜치
# feat/*   → 기능별 브랜치

git checkout -b staging
git push -u origin staging

git checkout -b dev
git push -u origin dev

# GitHub branch protection (main)
gh api repos/{owner}/playnode/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":[]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":0}'
```

```bash
# ─────────────────────────────────────────────
# 3. Railway 프로젝트 설정
# ─────────────────────────────────────────────

# Railway CLI 설치
npm install -g @railway/cli

# 로그인
railway login

# 프로젝트 생성
railway init --name playnode

# 서비스 3개 생성: frontend, indexer, database
# Railway 대시보드에서 또는 CLI로:

# PostgreSQL 추가
railway add --plugin postgresql

# 환경변수 설정 (Railway 대시보드 또는 CLI)
railway variables set SUI_NETWORK=testnet
railway variables set SUI_RPC_URL=https://fullnode.testnet.sui.io
railway variables set NODE_ENV=production
# ... (나머지 env vars)

# GitHub repo 연결
railway connect playnode
```

### Railway 서비스 구조

```
Railway Project: playnode
│
├── Service: frontend
│   ├── Source: packages/frontend
│   ├── Build: npm run build
│   ├── Start: npm run start
│   ├── Port: 3000
│   ├── Deploy branch: main (auto)
│   └── Domain: playnode.up.railway.app (→ 커스텀 도메인)
│
├── Service: indexer
│   ├── Source: packages/indexer
│   ├── Build: npm run build
│   ├── Start: npm run start
│   ├── Port: 4000
│   └── Deploy branch: main (auto)
│
├── Plugin: PostgreSQL
│   ├── Auto-provisioned
│   └── DATABASE_URL auto-injected
│
└── Environments:
    ├── production (branch: main)
    └── staging (branch: staging)
```

### railway.toml (프로젝트 루트)

```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "echo 'Use service-level configs'"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3
```

### packages/frontend/railway.toml

```toml
[build]
builder = "nixpacks"
buildCommand = "npm install && npm run build"

[deploy]
startCommand = "npm run start"
healthcheckPath = "/api/health"
healthcheckTimeout = 120
numReplicas = 1

[service]
internalPort = 3000
```

### packages/indexer/railway.toml

```toml
[build]
builder = "nixpacks"
buildCommand = "npm install && npx prisma generate && npx prisma db push && npm run build"

[deploy]
startCommand = "npm run start"
healthcheckPath = "/health"
healthcheckTimeout = 120
numReplicas = 1

[service]
internalPort = 4000
```

### 일상 개발 워크플로우

```bash
# ─────────────────────────────────────────────
# 일상 커밋 & 배포 플로우
# ─────────────────────────────────────────────

# 1. 기능 개발 (dev 브랜치에서)
git checkout dev
git pull origin dev

# 작업...

# 2. 커밋
git add .
git commit -m "feat: pixel grid dynamic pricing engine"

# 커밋 컨벤션:
#   feat:     새 기능
#   fix:      버그 수정
#   refactor: 리팩토링
#   style:    UI/스타일 변경
#   docs:     문서 업데이트
#   test:     테스트 추가
#   chore:    빌드/설정 변경
#   contract: Move 컨트랙트 변경

# 3. dev에 푸시
git push origin dev

# 4. staging 배포 (테스트)
git checkout staging
git merge dev
git push origin staging
# → Railway staging 환경 자동 배포

# 5. staging에서 검증 후 production 배포
git checkout main
git merge staging
git push origin main
# → Railway production 환경 자동 배포

# ─────────────────────────────────────────────
# Railway CLI 유용한 명령어
# ─────────────────────────────────────────────

# 배포 상태 확인
railway status

# 로그 확인 (실시간)
railway logs --service frontend
railway logs --service indexer

# 환경변수 확인
railway variables

# 환경변수 추가/수정
railway variables set KEY=value

# 배포 이력
railway deployments

# 특정 서비스 재시작
railway redeploy --service frontend

# 데이터베이스 접속
railway connect postgresql

# 로컬에서 Railway 환경변수로 실행 (개발 시)
railway run npm run dev
```

### Claude Code 워크플로우

```bash
# ─────────────────────────────────────────────
# Claude Code에서 작업 시 커밋 프로세스
# ─────────────────────────────────────────────

# Claude Code가 코드 수정 후:

# 1. 변경사항 확인
git status
git diff --stat

# 2. 스테이징 & 커밋
git add -A
git commit -m "feat: implement Drop purchase with USDC revenue split

- Add purchase_drop function in drop.move
- Implement revenue router 80/15/5 split
- Add PurchaseRecord dynamic field
- Frontend: purchase button + USDC approval flow
- Indexer: PurchaseEvent listener"

# 3. 푸시
git push origin dev

# 4. 빠른 staging 테스트 배포가 필요할 때
git checkout staging && git merge dev && git push origin staging && git checkout dev

# 5. production 배포가 필요할 때
git checkout main && git merge staging && git push origin main && git checkout dev

# ─────────────────────────────────────────────
# 원커맨드 배포 스크립트
# ─────────────────────────────────────────────

# scripts/deploy-staging.sh
#!/bin/bash
set -e
BRANCH=$(git branch --show-current)
git checkout staging
git merge $BRANCH --no-edit
git push origin staging
git checkout $BRANCH
echo "✅ Deployed to staging from $BRANCH"

# scripts/deploy-production.sh
#!/bin/bash
set -e
git checkout main
git merge staging --no-edit
git push origin main
git checkout dev
echo "✅ Deployed to production"
```

### Sui 컨트랙트 배포 프로세스

```bash
# ─────────────────────────────────────────────
# Move 컨트랙트 배포
# ─────────────────────────────────────────────

# Sui CLI 설정
sui client new-env --alias testnet --rpc https://fullnode.testnet.sui.io
sui client switch --env testnet

# 테스트넷 배포
cd packages/contracts
sui move build
sui move test           # 테스트 통과 확인
sui client publish --gas-budget 500000000

# 배포 결과에서 Package ID 추출 → env에 업데이트
# PACKAGE_ID=0x...
# 주요 Object ID들 (RevenueConfig 등) 기록

# Railway 환경변수 업데이트
railway variables set PACKAGE_ID=0x...
railway variables set REVENUE_CONFIG_ID=0x...

# 메인넷 배포 시
sui client switch --env mainnet
sui client publish --gas-budget 500000000

# 컨트랙트 업그레이드 (Sui는 package upgrade 지원)
sui client upgrade --upgrade-capability $UPGRADE_CAP_ID --gas-budget 500000000
```

### GitHub Actions (자동 체크)

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [dev, staging, main]
  pull_request:
    branches: [main, staging]

jobs:
  frontend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: packages/frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: packages/frontend/package-lock.json
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run build

  contracts:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: packages/contracts
    steps:
      - uses: actions/checkout@v4
      - uses: MystenLabs/sui-setup@v1
      - run: sui move build
      - run: sui move test

  indexer:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: packages/indexer
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: packages/indexer/package-lock.json
      - run: npm ci
      - run: npx prisma generate
      - run: npm run lint
      - run: npm run build
```

### 디렉토리 구조 업데이트 (DevOps 파일 포함)

```
playnode/
├── .github/
│   └── workflows/
│       └── ci.yml                 # GitHub Actions CI
├── scripts/
│   ├── deploy-staging.sh          # One-command staging deploy
│   ├── deploy-production.sh       # One-command production deploy
│   └── setup.sh                   # Initial project setup
├── railway.toml                   # Root Railway config
├── .gitignore
├── .env.example                   # Template (no secrets)
├── PRD.md
├── BRAND.md
│
├── packages/
│   ├── frontend/
│   │   ├── railway.toml           # Frontend Railway config
│   │   └── ...
│   ├── contracts/
│   │   └── ...
│   └── indexer/
│       ├── railway.toml           # Indexer Railway config
│       └── ...
│
└── docs/
    ├── PRD.md
    ├── BRAND.md
    └── brand-identity.html
```

---

## Testing Strategy

```
Unit Tests:
  - Move: sui move test (all contract modules)
  - Frontend: Jest + React Testing Library
  - Indexer: Jest

Integration Tests:
  - Sui devnet deployment + frontend E2E (Playwright)
  - Revenue distribution flow (purchase → split → verify balances)
  - Pixel Grid lifecycle (purchase → expire → auction → settle)
  - Playtime verification mock

Testnet Deployment:
  - Sui testnet for contract verification
  - Testnet USDC (faucet) for payment flows
```

---

## Security Considerations

```
Smart Contracts:
  - All USDC splits in single PTB (atomic, no partial state)
  - PixelBlock expiry checked against sui::clock (tamper-proof)
  - Quest escrow: funds locked until completion verified
  - Rank: no `store` ability prevents transfer/sale
  - Content hash stored on-chain prevents silent modification

Frontend:
  - zkLogin session management
  - Rate limiting on view counting
  - Content moderation pipeline (manual + automated)
  - Ad quality review (Rank Gold+ curators)

Infrastructure:
  - Indexer read-only from chain (no write without tx)
  - CDN cache for static content
  - DDoS protection
```

---

**PlayNode — "공략이 수익이 되는 곳."**

*Play. Share. Earn.*

*Built on Sui. Powered by USDC. Made for gamers.*
