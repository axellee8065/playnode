const API_BASE = process.env.NEXT_PUBLIC_INDEXER_URL || 'https://indexer-production-87da.up.railway.app';

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
}

// Type definitions matching the Prisma schema
export interface Node {
  id: string;
  owner: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  rank: number;
  reputation: number;
  totalDrops: number;
  totalReviews: number;
  totalViews: string; // BigInt serialized as string
  totalEarned: string;
  createdAt: string;
  drops?: Drop[];
  reviews?: Review[];
  gameProfiles?: GameProfile[];
}

export interface Drop {
  id: string;
  nodeId: string;
  node?: Node;
  author: string;
  title: string;
  contentHash: string;
  walrusBlobId: string;
  category: number;
  gameTag: string;
  price: string;
  isPremium: boolean;
  totalViews: string;
  totalPurchases: number;
  totalEarned: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  shopLinks?: ShopLink[];
}

export interface Review {
  id: string;
  nodeId: string;
  node?: Node;
  author: string;
  gameTag: string;
  rating: number;
  categoryRatings: number[];
  contentHash: string;
  walrusBlobId: string;
  verifiedPlaytimeHours: number;
  verificationLevel: number;
  helpfulCount: number;
  totalViews: string;
  totalEarned: string;
  createdAt: string;
}

export interface ShopLink {
  id: string;
  nodeId: string;
  creator: string;
  gameId: string;
  gameTitle: string;
  store: number;
  affiliateUrl: string;
  commissionRateBps: number;
  totalClicks: number;
  totalConversions: number;
  totalEarned: string;
}

export interface PixelGrid {
  id: string;
  parentType: number;
  parentId: string;
  width: number;
  height: number;
  totalPixels: number;
  soldPixels: number;
  basePrice: string;
  monthlyViews: string;
  totalRevenue: string;
  blocks?: PixelBlock[];
}

export interface PixelBlock {
  id: string;
  gridId: string;
  owner: string;
  x: number;
  y: number;
  width: number;
  height: number;
  pixelCount: number;
  imageUrl: string;
  linkUrl: string;
  pricePaid: string;
  expiresAt: string;
  status: number;
}

export interface Quest {
  id: string;
  creator: string;
  title: string;
  description: string;
  gameTag: string;
  rewardAmount: string;
  escrowBalance: string;
  minRank: number;
  deadline: string;
  status: number;
  assignedTo: string | null;
  createdAt: string;
}

export interface RevenueEvent {
  id: string;
  source: string;
  sourceId: string;
  amount: string;
  creatorAddr: string;
  creatorAmt: string;
  protocolAmt: string;
  txDigest: string;
  createdAt: string;
}

export interface GameProfile {
  id: string;
  nodeId: string;
  platform: string;
  username: string;
  verified: boolean;
  verifiedAt: string | null;
}

// Helper: convert BigInt string to display number (USDC has 6 decimals)
export function formatUsdc(amount: string | number): string {
  const num = Number(amount) / 1_000_000;
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatViews(views: string | number): string {
  const num = Number(views);
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

// API functions
export const api = {
  // Nodes
  getNodes: (params?: { take?: number; skip?: number; sort?: string }) =>
    fetchAPI<Node[]>(`/api/nodes?${new URLSearchParams(params as any)}`),
  getNode: (id: string) => fetchAPI<Node>(`/api/nodes/${id}`),
  getNodeDrops: (id: string) => fetchAPI<Drop[]>(`/api/nodes/${id}/drops`),
  getNodeReviews: (id: string) => fetchAPI<Review[]>(`/api/nodes/${id}/reviews`),
  getNodeRevenue: (id: string) => fetchAPI<RevenueEvent[]>(`/api/nodes/${id}/revenue`),

  // Drops
  getDrops: (params?: { take?: number; skip?: number; gameTag?: string; category?: string }) =>
    fetchAPI<Drop[]>(`/api/drops?${new URLSearchParams(params as any)}`),
  getDrop: (id: string) => fetchAPI<Drop>(`/api/drops/${id}`),
  recordView: (id: string) => fetchAPI<void>(`/api/drops/${id}/view`, { method: 'POST' }),

  // Reviews
  getReviews: (params?: { take?: number; gameTag?: string }) =>
    fetchAPI<Review[]>(`/api/reviews?${new URLSearchParams(params as any)}`),
  getReview: (id: string) => fetchAPI<Review>(`/api/reviews/${id}`),

  // Games
  getGames: () => fetchAPI<any[]>('/api/games'),
  getGame: (slug: string) => fetchAPI<any>(`/api/games/${slug}`),
  getGameDrops: (slug: string) => fetchAPI<Drop[]>(`/api/games/${slug}/drops`),
  getGameReviews: (slug: string) => fetchAPI<Review[]>(`/api/games/${slug}/reviews`),

  // Grids
  getGrids: () => fetchAPI<PixelGrid[]>('/api/grids'),
  getGrid: (id: string) => fetchAPI<PixelGrid>(`/api/grids/${id}`),

  // Quests
  getQuests: (params?: { status?: string; gameTag?: string }) =>
    fetchAPI<Quest[]>(`/api/quests?${new URLSearchParams(params as any)}`),

  // Shop
  getShopLinks: (nodeId: string) => fetchAPI<ShopLink[]>(`/api/shop/links/${nodeId}`),
  getBundles: () => fetchAPI<any[]>('/api/shop/bundles'),

  // Revenue
  getRevenue: (address: string) => fetchAPI<any>(`/api/revenue/${address}`),

  // Search
  search: (q: string) => fetchAPI<any>(`/api/search?q=${encodeURIComponent(q)}`),
};
