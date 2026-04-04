'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Clock, ChevronDown, Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, Badge, UsdcAmount } from '@/components/common';
import { api, formatViews, formatUsdc, type Drop } from '@/lib/api';
import { useApi } from '@/hooks/useApi';

/* ------------------------------------------------------------------ */
/*  Animation helpers                                                  */
/* ------------------------------------------------------------------ */
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const CATEGORIES = [
  { label: 'All', value: -1 },
  { label: 'Boss', value: 0 },
  { label: 'Build', value: 1 },
  { label: 'Quest', value: 2 },
  { label: 'Tier List', value: 3 },
  { label: 'Speedrun', value: 4 },
  { label: 'General', value: 5 },
] as const;

type SortMode = 'newest' | 'most-viewed' | 'top-earning';

const SORT_OPTIONS: { label: string; value: SortMode }[] = [
  { label: 'Newest', value: 'newest' },
  { label: 'Most Viewed', value: 'most-viewed' },
  { label: 'Top Earning', value: 'top-earning' },
];

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */
const MOCK_DROPS: Drop[] = Array.from({ length: 12 }, (_, i) => ({
  id: `mock-drop-${i}`,
  nodeId: `node-${i}`,
  author: ['GameMaster_KR', 'SpeedKing', 'MetaHunter', 'ProBuilder', 'QuestWalker', 'TierGod'][i % 6],
  title: [
    'Charge Blade Master Guide',
    'Elden Ring Speedrun Route v4',
    'Valorant Tier List S8',
    'Baldur\'s Gate 3 Optimal Builds',
    'Zelda TotK All Shrines',
    'Palworld Base Building Meta',
    'FF7 Rebirth Boss Rush Guide',
    'Helldivers 2 Loadout Optimizer',
    'Dragon\'s Dogma 2 Vocation Tier List',
    'Stellar Blade Combo Guide',
    'Like a Dragon Infinite Wealth Quest Log',
    'Monster Hunter Wilds Gunlance Guide',
  ][i],
  contentHash: '',
  walrusBlobId: '',
  category: i % 6,
  gameTag: ['MH_WILDS', 'ELDEN_RING', 'VALORANT', 'BG3', 'ZELDA_TOTK', 'PALWORLD', 'FF7_REBIRTH', 'HELLDIVERS_2', 'DD2', 'STELLAR_BLADE', 'LAD_IW', 'MH_WILDS'][i],
  price: String([3990000, 0, 1990000, 4990000, 2990000, 0, 3490000, 1990000, 0, 2490000, 1490000, 3990000][i]),
  isPremium: i % 3 !== 1,
  totalViews: String([24300, 18100, 41200, 12800, 9400, 31500, 8700, 22100, 15600, 6300, 19800, 11200][i]),
  totalPurchases: [842, 0, 1203, 567, 234, 0, 445, 890, 0, 178, 623, 394][i],
  totalEarned: String([3359000000, 0, 2394000000, 2830000000, 699000000, 0, 1553000000, 1771000000, 0, 443000000, 929000000, 1569000000][i]),
  version: 1,
  createdAt: new Date(Date.now() - i * 86400000 * 3).toISOString(),
  updatedAt: new Date(Date.now() - i * 86400000 * 2).toISOString(),
}));

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function DropsPage() {
  const [activeCategory, setActiveCategory] = useState(-1);
  const [sort, setSort] = useState<SortMode>('newest');
  const [visibleCount, setVisibleCount] = useState(12);

  const categoryParam = activeCategory >= 0 ? String(activeCategory) : undefined;
  const { data: apiDrops, loading } = useApi(
    () => api.getDrops({ take: 20, category: categoryParam }),
    [categoryParam],
  );

  const drops = (apiDrops && apiDrops.length > 0 ? apiDrops : MOCK_DROPS);

  // Client-side filter + sort
  const filtered = drops
    .filter((d) => activeCategory < 0 || d.category === activeCategory)
    .sort((a, b) => {
      if (sort === 'most-viewed') return Number(b.totalViews) - Number(a.totalViews);
      if (sort === 'top-earning') return Number(b.totalEarned) - Number(a.totalEarned);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const visible = filtered.slice(0, visibleCount);

  return (
    <div className="min-h-screen bg-pn-black flex flex-col">
      <Header />

      {/* Background effects */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(42,42,50,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(42,42,50,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      <div className="pointer-events-none absolute left-1/2 top-0 z-0 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-pn-green/5 blur-[120px]" />

      <main className="relative z-10 flex-1">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-6 pt-16 pb-20">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mb-10"
          >
            <h1 className="font-primary text-4xl font-extrabold text-pn-white sm:text-5xl tracking-tight">
              ALL DROPS
            </h1>
            <p className="mt-2 text-pn-muted text-lg">
              Browse game guides and walkthroughs
            </p>
          </motion.div>

          {/* Filter bar */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
          >
            {/* Category pills */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    activeCategory === cat.value
                      ? 'bg-pn-green/20 text-pn-green border border-pn-green/30'
                      : 'bg-pn-surface border border-pn-border text-pn-muted hover:text-pn-white hover:border-pn-border-light'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Sort select */}
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortMode)}
                className="appearance-none bg-pn-surface border border-pn-border rounded-lg px-4 py-2 pr-8 text-sm text-pn-text cursor-pointer hover:border-pn-border-light transition-colors focus:outline-none focus:border-pn-green/50"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-pn-muted pointer-events-none" />
            </div>
          </motion.div>

          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 text-pn-green animate-spin" />
            </div>
          )}

          {/* Grid */}
          {!loading && (
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {visible.map((drop) => {
                const price = Number(drop.price) / 1_000_000;
                const isFree = price === 0;

                return (
                  <motion.a
                    key={drop.id}
                    href={`/drop/${drop.id}`}
                    variants={fadeUp}
                  >
                    <Card className="!p-0 overflow-hidden group cursor-pointer hover:border-pn-border-light transition-colors h-full">
                      {/* Thumbnail placeholder */}
                      <div className="h-32 bg-pn-dark flex items-center justify-center border-b border-pn-border">
                        <span className="font-mono text-xs text-pn-muted uppercase tracking-wider">
                          {drop.gameTag}
                        </span>
                      </div>

                      <div className="p-4 flex flex-col gap-2">
                        {/* Game tag badge */}
                        <span className="inline-flex self-start items-center rounded-md bg-pn-amber/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-pn-amber">
                          {drop.gameTag}
                        </span>

                        {/* Title */}
                        <h3 className="text-sm font-semibold text-pn-white leading-snug line-clamp-2 group-hover:text-pn-green transition-colors">
                          {drop.title}
                        </h3>

                        {/* Author */}
                        <p className="text-xs text-pn-muted">{drop.node?.displayName || drop.author}</p>

                        {/* Footer row */}
                        <div className="flex items-center justify-between mt-auto pt-2 border-t border-pn-border">
                          {isFree ? (
                            <span className="font-mono text-sm font-bold text-pn-green">FREE</span>
                          ) : (
                            <UsdcAmount amount={price} size="sm" showLabel />
                          )}

                          <div className="flex items-center gap-3 text-[11px] text-pn-muted">
                            <span className="inline-flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {formatViews(drop.totalViews)}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(drop.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.a>
                );
              })}
            </motion.div>
          )}

          {/* Empty state */}
          {!loading && visible.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-pn-muted text-lg">No drops found</p>
              <p className="text-pn-muted/60 text-sm mt-1">Try a different category or sort</p>
            </div>
          )}

          {/* Load More */}
          {!loading && visibleCount < filtered.length && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center mt-10"
            >
              <button
                onClick={() => setVisibleCount((c) => c + 12)}
                className="px-6 py-3 rounded-xl bg-pn-surface border border-pn-border text-sm font-medium text-pn-text hover:text-pn-white hover:border-pn-border-light transition-colors"
              >
                Load More
              </button>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
