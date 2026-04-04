'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, List } from 'lucide-react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import CategoryBar from '@/components/layout/CategoryBar';
import ContentCard from '@/components/feed/ContentCard';
import { FeedSkeleton } from '@/components/common/Skeleton';
import { api, formatViews, type Drop, type Review } from '@/lib/api';
import { GAME_CATEGORIES, getGameLabel, getCategoryLabel } from '@/lib/games';
import { useApi } from '@/hooks/useApi';

/* ------------------------------------------------------------------ */
/*  Animation                                                          */
/* ------------------------------------------------------------------ */

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

/* ------------------------------------------------------------------ */
/*  Category bar items                                                 */
/* ------------------------------------------------------------------ */

const categoryItems = [
  { value: 'all', label: 'All' },
  ...GAME_CATEGORIES.map((g) => ({ value: g.tag, label: g.label })),
];

/* ------------------------------------------------------------------ */
/*  Mock feed data (fallback when API is unavailable)                  */
/* ------------------------------------------------------------------ */

interface FeedItem {
  type: 'drop' | 'review';
  id: string;
  title: string;
  gameTag: string;
  author: string;
  views: number;
  price: number;
  isPremium: boolean;
  rating?: number;
  verifiedHours?: number;
  createdAt: string;
  category?: number;
}

const MOCK_FEED: FeedItem[] = [
  { type: 'drop', id: 'd1', title: 'Monster Hunter Wilds - Charge Blade Masterclass', gameTag: 'monster_hunter_wilds', author: 'HunterPro', views: 84200, price: 2000000, isPremium: true, createdAt: '2026-04-03T10:00:00Z', category: 1 },
  { type: 'drop', id: 'd2', title: 'Elden Ring DLC - Every Secret Boss Location', gameTag: 'elden_ring', author: 'SoulsMaster', views: 142800, price: 0, isPremium: false, createdAt: '2026-04-03T08:30:00Z', category: 0 },
  { type: 'review', id: 'r1', title: 'Stellar Blade - 60 Hours In, Here\'s the Truth', gameTag: 'stellar_blade', author: 'HonestGamer', views: 67500, price: 0, isPremium: false, rating: 88, verifiedHours: 62, createdAt: '2026-04-02T22:00:00Z' },
  { type: 'drop', id: 'd3', title: 'FF7 Rebirth - Platinum Trophy Roadmap', gameTag: 'ff7_rebirth', author: 'TrophyHunter', views: 53100, price: 1500000, isPremium: true, createdAt: '2026-04-02T18:00:00Z', category: 2 },
  { type: 'drop', id: 'd4', title: 'Palworld Breeding Calculator & Tier List', gameTag: 'palworld', author: 'PalExpert', views: 91400, price: 0, isPremium: false, createdAt: '2026-04-02T14:00:00Z', category: 3 },
  { type: 'review', id: 'r2', title: 'Hollow Knight: Silksong - Worth the Wait?', gameTag: 'hollow_knight_silksong', author: 'IndieEnjoyer', views: 112300, price: 0, isPremium: false, rating: 95, verifiedHours: 45, createdAt: '2026-04-02T12:00:00Z' },
  { type: 'drop', id: 'd5', title: 'GTA VI First Look - Everything We Know', gameTag: 'gta_vi', author: 'RockstarLeaks', views: 284000, price: 0, isPremium: false, createdAt: '2026-04-01T20:00:00Z', category: 5 },
  { type: 'drop', id: 'd6', title: 'Hades II - Best Boon Combos for Each Weapon', gameTag: 'hades_2', author: 'RogueRunner', views: 38900, price: 1000000, isPremium: true, createdAt: '2026-04-01T16:00:00Z', category: 1 },
  { type: 'review', id: 'r3', title: 'Monster Hunter Wilds - 100 Hour Review', gameTag: 'monster_hunter_wilds', author: 'VeteranHunter', views: 95600, price: 0, isPremium: false, rating: 92, verifiedHours: 108, createdAt: '2026-04-01T10:00:00Z' },
  { type: 'drop', id: 'd7', title: 'Elden Ring - Speedrun Any% in Under 30 Min', gameTag: 'elden_ring', author: 'SpeedDemon', views: 201000, price: 0, isPremium: false, createdAt: '2026-03-31T22:00:00Z', category: 4 },
  { type: 'drop', id: 'd8', title: 'Stellar Blade - All Nano Suit Locations', gameTag: 'stellar_blade', author: 'CollectorX', views: 44200, price: 500000, isPremium: false, createdAt: '2026-03-31T18:00:00Z', category: 2 },
  { type: 'review', id: 'r4', title: 'FF7 Rebirth - The Definitive JRPG Experience', gameTag: 'ff7_rebirth', author: 'JRPGFan', views: 78300, price: 0, isPremium: false, rating: 96, verifiedHours: 85, createdAt: '2026-03-31T14:00:00Z' },
  { type: 'drop', id: 'd9', title: 'Palworld - Factory Automation Guide', gameTag: 'palworld', author: 'PalExpert', views: 62100, price: 0, isPremium: false, createdAt: '2026-03-31T10:00:00Z', category: 5 },
  { type: 'drop', id: 'd10', title: 'Hades II - How to Beat the Surface Bosses', gameTag: 'hades_2', author: 'RogueRunner', views: 29800, price: 0, isPremium: false, createdAt: '2026-03-30T20:00:00Z', category: 0 },
  { type: 'review', id: 'r5', title: 'GTA VI - Early Access Impressions', gameTag: 'gta_vi', author: 'OpenWorldFan', views: 341000, price: 0, isPremium: false, rating: 90, verifiedHours: 30, createdAt: '2026-03-30T16:00:00Z' },
  { type: 'drop', id: 'd11', title: 'Monster Hunter Wilds - Endgame Farming Routes', gameTag: 'monster_hunter_wilds', author: 'GrindMaster', views: 55800, price: 2500000, isPremium: true, createdAt: '2026-03-30T12:00:00Z', category: 1 },
  { type: 'review', id: 'r6', title: 'Palworld - Six Months Later', gameTag: 'palworld', author: 'SurvivalGuru', views: 48200, price: 0, isPremium: false, rating: 78, verifiedHours: 200, createdAt: '2026-03-30T08:00:00Z' },
  { type: 'drop', id: 'd12', title: 'Elden Ring - All Legendary Armaments Guide', gameTag: 'elden_ring', author: 'LoreHunter', views: 87600, price: 0, isPremium: false, createdAt: '2026-03-29T18:00:00Z', category: 2 },
  { type: 'review', id: 'r7', title: 'Hades II Early Access - A Worthy Sequel', gameTag: 'hades_2', author: 'IndieEnjoyer', views: 63100, price: 0, isPremium: false, rating: 91, verifiedHours: 55, createdAt: '2026-03-29T12:00:00Z' },
  { type: 'drop', id: 'd13', title: 'Hollow Knight: Silksong - All Charm Locations', gameTag: 'hollow_knight_silksong', author: 'BugKnight', views: 71200, price: 1000000, isPremium: true, createdAt: '2026-03-29T08:00:00Z', category: 2 },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function dropsToFeedItems(drops: Drop[]): FeedItem[] {
  return drops.map((d) => ({
    type: 'drop' as const,
    id: d.id,
    title: d.title,
    gameTag: d.gameTag,
    author: d.node?.displayName || d.author?.slice(0, 8) || 'Game Curator',
    views: Number(d.totalViews),
    price: Number(d.price),
    isPremium: d.isPremium,
    createdAt: d.createdAt,
    category: d.category,
  }));
}

function reviewsToFeedItems(reviews: Review[]): FeedItem[] {
  return reviews.map((r) => ({
    type: 'review' as const,
    id: r.id,
    title: `${getGameLabel(r.gameTag)} Review`,
    gameTag: r.gameTag,
    author: r.node?.displayName || r.author?.slice(0, 8) || 'Reviewer',
    views: Number(r.totalViews),
    price: 0,
    isPremium: false,
    rating: r.rating,
    verifiedHours: r.verifiedPlaytimeHours,
    createdAt: r.createdAt,
  }));
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function HomePage() {
  const [activeGame, setActiveGame] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch live data
  const { data: apiDrops, loading: loadingDrops } = useApi(() => api.getDrops({ take: 20 }), []);
  const { data: apiReviews, loading: loadingReviews } = useApi(() => api.getReviews({ take: 8 }), []);
  const loading = loadingDrops || loadingReviews;

  // Build feed: merge API data or fall back to mocks
  const feed = useMemo(() => {
    const hasApi =
      (Array.isArray(apiDrops) && apiDrops.length > 0) ||
      (Array.isArray(apiReviews) && apiReviews.length > 0);

    if (!hasApi) return MOCK_FEED;

    const items: FeedItem[] = [
      ...(Array.isArray(apiDrops) ? dropsToFeedItems(apiDrops) : []),
      ...(Array.isArray(apiReviews) ? reviewsToFeedItems(apiReviews) : []),
    ];
    items.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    return items;
  }, [apiDrops, apiReviews]);

  // Filter by selected game
  const filtered = useMemo(() => {
    if (activeGame === 'all') return feed;
    return feed.filter((item) => item.gameTag === activeGame);
  }, [feed, activeGame]);

  return (
    <div className="min-h-screen bg-pn-black">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-0 md:ml-[240px] pt-14">
          <CategoryBar
            items={categoryItems}
            active={activeGame}
            onChange={setActiveGame}
          />
          <div className="px-4 md:px-6 py-6">
            {/* Loading spinner — hide ALL content while loading */}
            {loading && !apiDrops && !apiReviews ? (
              <FeedSkeleton />
            ) : (<>

            {/* Trending section — top 3 items */}
            {activeGame === 'all' && (
              <section className="mb-8">
                <h2 className="text-pn-white font-bold text-lg mb-4 font-mono">
                  Trending Now
                </h2>
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                  variants={stagger}
                  initial="hidden"
                  animate="show"
                >
                  {filtered.slice(0, 3).map((item) => (
                    <motion.div key={`t-${item.id}`} variants={fadeUp}>
                      <ContentCard
                        type={item.type}
                        id={item.id}
                        title={item.title}
                        gameTag={item.gameTag}
                        author={item.author}
                        views={String(item.views)}
                        price={String(item.price)}
                        isPremium={item.isPremium}
                        rating={item.rating}
                        verifiedHours={item.verifiedHours}
                        createdAt={item.createdAt}
                        category={item.category}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </section>
            )}

            {/* Main feed */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-pn-white font-bold text-lg font-mono">
                  {activeGame === 'all' ? 'Latest Content' : getGameLabel(activeGame)}
                </h2>
                <div className="flex items-center gap-1 ml-auto">
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
              <motion.div
                className={viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                  : 'flex flex-col'}
                variants={stagger}
                initial="hidden"
                animate="show"
              >
                {(activeGame === 'all' ? filtered.slice(4) : filtered).map(
                  (item) => (
                    <motion.div key={item.id} variants={fadeUp}>
                      <ContentCard
                        type={item.type}
                        id={item.id}
                        title={item.title}
                        gameTag={item.gameTag}
                        author={item.author}
                        views={String(item.views)}
                        price={String(item.price)}
                        isPremium={item.isPremium}
                        rating={item.rating}
                        verifiedHours={item.verifiedHours}
                        createdAt={item.createdAt}
                        category={item.category}
                        variant={viewMode === 'list' ? 'list' : 'card'}
                      />
                    </motion.div>
                  ),
                )}
              </motion.div>

              {filtered.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-pn-muted font-mono text-sm">
                    No content found for this game yet.
                  </p>
                </div>
              )}
            </section>
            </>)}
          </div>
        </main>
      </div>
    </div>
  );
}
