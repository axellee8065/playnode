'use client';

import { useState } from 'react';
import { Loader2, LayoutGrid, List } from 'lucide-react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import ContentCard from '@/components/feed/ContentCard';
import { GAME_CATEGORIES, getGameLabel } from '@/lib/games';
import { api, formatViews, type Review } from '@/lib/api';
import { useApi } from '@/hooks/useApi';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const GAME_ITEMS = GAME_CATEGORIES.map((g) => ({
  label: g.label,
  value: g.tag,
}));

const RATING_FILTERS = [
  { label: 'All', value: 0 },
  { label: '7+', value: 7 },
  { label: '8+', value: 8 },
] as const;

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */
const MOCK_REVIEWS: Review[] = Array.from({ length: 20 }, (_, i) => ({
  id: `mock-review-${i}`,
  nodeId: `node-${i}`,
  author: ['DragonSlayer', 'CriticalGamer', 'RPG_Sage', 'ActionFan99', 'SoulsBorne_Vet', 'JRPG_Master', 'TacticalOps', 'CasualKing', 'IndieFan', 'MMO_Sage', 'FPS_Hawk', 'StrategyNerd', 'RetroGamer', 'MechaPilot', 'HunterPro_KR', 'BowGod', 'SpeedRunner_JP', 'RPG_Queen', 'TechReviewer', 'NewbieHelper'][i],
  gameTag: ['ELDEN_RING', 'BG3', 'FF7_REBIRTH', 'STELLAR_BLADE', 'SEKIRO', 'PERSONA_5R', 'HELLDIVERS_2', 'PALWORLD', 'HOLLOW_KNIGHT', 'LOST_ARK', 'VALORANT', 'CIV_VII', 'HADES_2', 'ARMORED_CORE_6', 'MH_WILDS', 'MH_WILDS', 'ELDEN_RING', 'FF7_REBIRTH', 'STELLAR_BLADE', 'PALWORLD'][i],
  rating: [92, 95, 88, 84, 96, 94, 87, 79, 93, 82, 76, 89, 91, 85, 90, 88, 97, 86, 83, 74][i],
  categoryRatings: [85, 90, 88, 92, 80],
  contentHash: '',
  walrusBlobId: '',
  verifiedPlaytimeHours: [240, 180, 95, 62, 310, 150, 120, 45, 200, 160, 80, 130, 110, 75, 280, 190, 350, 100, 55, 30][i],
  verificationLevel: [2, 2, 1, 1, 2, 1, 1, 0, 2, 1, 1, 1, 2, 1, 2, 1, 2, 1, 1, 0][i],
  helpfulCount: [347, 512, 198, 89, 623, 441, 267, 54, 389, 156, 78, 234, 312, 145, 478, 201, 567, 123, 67, 34][i],
  totalViews: String([18400, 31200, 9800, 5600, 42100, 27800, 15300, 3200, 22500, 11800, 6400, 14200, 19600, 8700, 35400, 16900, 48200, 7500, 4100, 2300][i]),
  totalEarned: '0',
  createdAt: new Date(Date.now() - i * 86400000 * 3).toISOString(),
}));

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function ReviewsPage() {
  const [gameFilter, setGameFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const gameTagParam = gameFilter !== 'all' ? gameFilter : undefined;
  const { data: apiReviews, loading } = useApi(
    () => api.getReviews({ take: 20, gameTag: gameTagParam }),
    [gameTagParam],
  );

  const reviews = apiReviews && apiReviews.length > 0 ? apiReviews : MOCK_REVIEWS;

  // Client-side filtering
  const filtered = reviews.filter((r) => {
    if (gameFilter !== 'all' && r.gameTag !== gameFilter) return false;
    if (ratingFilter > 0 && r.rating < ratingFilter * 10) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-pn-black">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-0 lg:ml-56 pt-16">
          <div className="px-4 lg:px-6 py-6">
            {/* Page title + filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <h1 className="font-mono text-sm font-semibold uppercase tracking-wider text-pn-muted">
                  Reviews
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

              <div className="flex flex-wrap items-center gap-3">
                {/* Game filter */}
                <select
                  value={gameFilter}
                  onChange={(e) => setGameFilter(e.target.value)}
                  className="bg-pn-surface-2 border border-pn-border rounded-lg px-3 py-1.5 text-xs text-pn-text focus:outline-none focus:border-pn-cyan/50 transition-colors"
                >
                  <option value="all">All Games</option>
                  {GAME_ITEMS.map((g) => (
                    <option key={g.value} value={g.value}>{g.label}</option>
                  ))}
                </select>

                {/* Rating filter pills */}
                <div className="flex gap-2">
                  {RATING_FILTERS.map((rf) => (
                    <button
                      key={rf.value}
                      onClick={() => setRatingFilter(rf.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        ratingFilter === rf.value
                          ? 'bg-pn-white text-pn-black font-semibold'
                          : 'bg-pn-surface-2 text-pn-muted hover:text-pn-white'
                      }`}
                    >
                      {rf.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Loading state */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 text-pn-cyan animate-spin" />
              </div>
            )}

            {/* Grid */}
            {!loading && (
              <div className={viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                : 'flex flex-col'}>
                {filtered.map((review) => (
                  <ContentCard
                    key={review.id}
                    type="review"
                    id={review.id}
                    title={`${getGameLabel(review.gameTag)} Review`}
                    gameTag={review.gameTag}
                    author={review.node?.displayName || review.author}
                    views={formatViews(review.totalViews)}
                    rating={review.rating / 10}
                    verifiedHours={review.verifiedPlaytimeHours}
                    createdAt={review.createdAt}
                    variant={viewMode === 'list' ? 'list' : 'card'}
                  />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-pn-muted text-lg">No reviews found</p>
                <p className="text-pn-muted/60 text-sm mt-1">Try adjusting your filters</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
