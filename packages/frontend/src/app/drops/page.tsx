'use client';

import { useState } from 'react';
import { Loader2, LayoutGrid, List } from 'lucide-react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import ContentCard from '@/components/feed/ContentCard';
import CategoryBar from '@/components/layout/CategoryBar';
import { CONTENT_CATEGORIES } from '@/lib/games';
import { api, formatViews, type Drop } from '@/lib/api';
import { useApi } from '@/hooks/useApi';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const CATEGORY_ITEMS = CONTENT_CATEGORIES.map((c) => ({
  label: c.label,
  value: String(c.id),
}));

type SortMode = 'trending' | 'newest' | 'most-viewed' | 'top-earning';

const SORT_OPTIONS: { label: string; value: SortMode }[] = [
  { label: 'Trending', value: 'trending' },
  { label: 'Newest', value: 'newest' },
  { label: 'Most Viewed', value: 'most-viewed' },
  { label: 'Top Earning', value: 'top-earning' },
];

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */
const MOCK_DROPS: Drop[] = Array.from({ length: 24 }, (_, i) => ({
  id: `mock-drop-${i}`,
  nodeId: `node-${i}`,
  author: ['GameMaster_KR', 'SpeedKing', 'MetaHunter', 'ProBuilder', 'QuestWalker', 'TierGod'][i % 6],
  title: [
    'Charge Blade Master Guide',
    'Elden Ring Speedrun Route v4',
    'Valorant Tier List S8',
    "Baldur's Gate 3 Optimal Builds",
    'Zelda TotK All Shrines',
    'Palworld Base Building Meta',
    'FF7 Rebirth Boss Rush Guide',
    'Helldivers 2 Loadout Optimizer',
    "Dragon's Dogma 2 Vocation Tier List",
    'Stellar Blade Combo Guide',
    'Like a Dragon Infinite Wealth Quest Log',
    'Monster Hunter Wilds Gunlance Guide',
    'Hades II Heat 32 Guide',
    'Hollow Knight Silksong Charms',
    'Elden Ring Nightreign Co-op Builds',
    'Palworld Breeding Calculator',
    'Valorant Ascent Smoke Lineups',
    'MH Wilds Lance Counter Timing',
    'FF7 Rebirth Hard Mode Walkthrough',
    'Stellar Blade Nano Suit Locations',
    'GTA VI Early Mission Guide',
    'Civilization VII Science Victory',
    'Lost Ark Season 3 Engravings',
    'Monster Hunter Wilds Bow Guide',
  ][i],
  contentHash: '',
  walrusBlobId: '',
  category: i % 6,
  gameTag: ['MH_WILDS', 'ELDEN_RING', 'VALORANT', 'BG3', 'ZELDA_TOTK', 'PALWORLD', 'FF7_REBIRTH', 'HELLDIVERS_2', 'DD2', 'STELLAR_BLADE', 'LAD_IW', 'MH_WILDS', 'HADES_2', 'HOLLOW_KNIGHT', 'ELDEN_RING', 'PALWORLD', 'VALORANT', 'MH_WILDS', 'FF7_REBIRTH', 'STELLAR_BLADE', 'GTA_VI', 'CIV_VII', 'LOST_ARK', 'MH_WILDS'][i],
  price: String([3990000, 0, 1990000, 4990000, 2990000, 0, 3490000, 1990000, 0, 2490000, 1490000, 3990000, 0, 2990000, 4990000, 0, 1990000, 3990000, 5990000, 2490000, 0, 3490000, 2990000, 3990000][i]),
  isPremium: i % 3 !== 1,
  totalViews: String([24300, 18100, 41200, 12800, 9400, 31500, 8700, 22100, 15600, 6300, 19800, 11200, 28400, 16700, 35200, 21000, 44100, 13500, 27800, 8900, 52300, 19400, 23600, 30100][i]),
  totalPurchases: [842, 0, 1203, 567, 234, 0, 445, 890, 0, 178, 623, 394, 0, 312, 1105, 0, 876, 423, 1340, 195, 0, 687, 534, 812][i],
  totalEarned: String([3359000000, 0, 2394000000, 2830000000, 699000000, 0, 1553000000, 1771000000, 0, 443000000, 929000000, 1569000000, 0, 933000000, 5510000000, 0, 1743000000, 1685000000, 8023000000, 486000000, 0, 2399000000, 1597000000, 3235000000][i]),
  version: 1,
  createdAt: new Date(Date.now() - i * 86400000 * 2).toISOString(),
  updatedAt: new Date(Date.now() - i * 86400000).toISOString(),
}));

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function DropsPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [sort, setSort] = useState<SortMode>('trending');
  const [visibleCount, setVisibleCount] = useState(24);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categoryParam = activeCategory !== 'all' ? activeCategory : undefined;
  const { data: apiDrops, loading } = useApi(
    () => api.getDrops({ take: 24, category: categoryParam }),
    [categoryParam],
  );

  const drops = apiDrops && apiDrops.length > 0 ? apiDrops : MOCK_DROPS;

  // Client-side filter + sort
  const filtered = drops
    .filter((d) => activeCategory === 'all' || d.category === Number(activeCategory))
    .sort((a, b) => {
      if (sort === 'most-viewed') return Number(b.totalViews) - Number(a.totalViews);
      if (sort === 'top-earning') return Number(b.totalEarned) - Number(a.totalEarned);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const visible = filtered.slice(0, visibleCount);

  return (
    <div className="min-h-screen bg-pn-black">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-0 lg:ml-56 pt-16">
          {/* Category Bar */}
          <CategoryBar
            items={CATEGORY_ITEMS}
            active={activeCategory}
            onChange={setActiveCategory}
          />

          <div className="px-4 lg:px-6 py-6">
            {/* Page title + sort pills */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <h1 className="font-mono text-sm font-semibold uppercase tracking-wider text-pn-muted">
                  Guides
                </h1>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'text-pn-white' : 'text-pn-muted hover:text-pn-white'}`}
                    title="Grid view"
                  >
                    <LayoutGrid size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'text-pn-white' : 'text-pn-muted hover:text-pn-white'}`}
                    title="List view"
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSort(opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      sort === opt.value
                        ? 'bg-pn-white text-pn-black font-semibold'
                        : 'bg-pn-surface-2 text-pn-muted hover:text-pn-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Loading state */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 text-pn-green animate-spin" />
              </div>
            )}

            {/* Grid */}
            {!loading && (
              <div className={viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                : 'flex flex-col'}>
                {visible.map((drop) => (
                  <ContentCard
                    key={drop.id}
                    type="drop"
                    id={drop.id}
                    title={drop.title}
                    gameTag={drop.gameTag}
                    author={drop.node?.displayName || drop.author}
                    views={formatViews(drop.totalViews)}
                    price={drop.isPremium ? String(Number(drop.price) / 1_000_000) : undefined}
                    isPremium={drop.isPremium}
                    createdAt={drop.createdAt}
                    category={drop.category}
                    variant={viewMode === 'list' ? 'list' : 'card'}
                  />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && visible.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-pn-muted text-lg">No guides found</p>
                <p className="text-pn-muted/60 text-sm mt-1">Try a different category or sort</p>
              </div>
            )}

            {/* Load More */}
            {!loading && visibleCount < filtered.length && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={() => setVisibleCount((c) => c + 12)}
                  className="px-6 py-3 rounded-xl bg-pn-surface border border-pn-border text-sm font-medium text-pn-muted hover:text-pn-white hover:border-pn-border-light transition-colors"
                >
                  Load More
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
