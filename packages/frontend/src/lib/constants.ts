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
  taglineKR: "공략이 수익이 되는 곳.",
  description: "Game Creator Economy Platform on Sui",
  url: "https://playnode.gg",
} as const;

// Feature modules
export const FEATURES = [
  {
    key: "drop",
    label: "DROP",
    title: "공략 드롭",
    description: "게임 공략을 NFT로 발행하고 수익을 창출하세요.",
    color: "pn-green",
    icon: "Zap",
  },
  {
    key: "review",
    label: "REVIEW",
    title: "리뷰 & 평가",
    description: "공략을 리뷰하고 품질 점수에 기여하세요.",
    color: "pn-cyan",
    icon: "Star",
  },
  {
    key: "shop",
    label: "SHOP",
    title: "마켓플레이스",
    description: "프리미엄 공략을 거래하고 소유하세요.",
    color: "pn-purple",
    icon: "ShoppingBag",
  },
  {
    key: "grid",
    label: "GRID",
    title: "큐레이션 그리드",
    description: "트렌딩 공략을 발견하고 큐레이션하세요.",
    color: "pn-amber",
    icon: "LayoutGrid",
  },
  {
    key: "quest",
    label: "QUEST",
    title: "퀘스트 시스템",
    description: "일일/주간 퀘스트를 완료하고 보상을 받으세요.",
    color: "pn-blue",
    icon: "Target",
  },
  {
    key: "rank",
    label: "RANK",
    title: "랭킹 & 명예",
    description: "크리에이터 랭킹에 올라 명예를 획득하세요.",
    color: "pn-red",
    icon: "Trophy",
  },
] as const;

// Stats (mock data for landing)
export const STATS = [
  { label: "Creator Revenue", value: "$2.4M+" },
  { label: "Active Creators", value: "12K+" },
  { label: "Drops Published", value: "180K+" },
] as const;
