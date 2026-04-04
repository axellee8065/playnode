// ---------------------------------------------------------------------------
// PlayNode — Constants & Configuration
// ---------------------------------------------------------------------------

// Sui Contract Addresses (populated after deployment)
export const CONTRACTS = {
  PACKAGE_ID: "",
  DROP_REGISTRY: "",
  REVIEW_REGISTRY: "",
  SHOP_REGISTRY: "",
  QUEST_REGISTRY: "",
  RANK_REGISTRY: "",
  TREASURY: "",
  ADMIN_CAP: "",
} as const;

// Network
export const SUI_NETWORK = (process.env.NEXT_PUBLIC_SUI_NETWORK ??
  "testnet") as "mainnet" | "testnet" | "devnet";

// API URLs
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
export const INDEXER_URL =
  process.env.NEXT_PUBLIC_INDEXER_URL ?? "http://localhost:4001";

// Brand
export const BRAND = {
  name: "PlayNode",
  tagline: "Play. Share. Earn.",
  taglineKR: "Where guides become revenue.",
  description: "Game Curator Economy Platform on Sui",
  url: "https://playnode.gg",
} as const;

// Feature modules
export const FEATURES = [
  {
    key: "drop",
    label: "DROP",
    title: "Guide Drop",
    description: "Publish game guides as NFTs and earn revenue.",
    color: "pn-green",
    icon: "Zap",
  },
  {
    key: "review",
    label: "REVIEW",
    title: "Review & Rate",
    description: "Review guides and contribute to quality scores.",
    color: "pn-cyan",
    icon: "Star",
  },
  {
    key: "shop",
    label: "SHOP",
    title: "Marketplace",
    description: "Trade and own premium guides.",
    color: "pn-purple",
    icon: "ShoppingBag",
  },
  {
    key: "grid",
    label: "GRID",
    title: "Curation Grid",
    description: "Discover and curate trending guides.",
    color: "pn-amber",
    icon: "LayoutGrid",
  },
  {
    key: "quest",
    label: "QUEST",
    title: "Quest System",
    description: "Complete daily/weekly quests and earn rewards.",
    color: "pn-blue",
    icon: "Target",
  },
  {
    key: "rank",
    label: "RANK",
    title: "Ranking & Honor",
    description: "Climb the game curator rankings and earn prestige.",
    color: "pn-red",
    icon: "Trophy",
  },
] as const;

// Stats (mock data for landing)
export const STATS = [
  { label: "Curator Revenue", value: "$2.4M+" },
  { label: "Active Curators", value: "12K+" },
  { label: "Drops Published", value: "180K+" },
] as const;
