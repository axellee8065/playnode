'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, Clock, Star, ShieldCheck, ChevronDown, Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, Badge } from '@/components/common';
import { api, formatViews, type Review } from '@/lib/api';
import { useApi } from '@/hooks/useApi';

/* ------------------------------------------------------------------ */
/*  Animation helpers                                                  */
/* ------------------------------------------------------------------ */
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const RATING_FILTERS = [
  { label: 'All', value: 0 },
  { label: '7+', value: 7 },
  { label: '8+', value: 8 },
] as const;

const VERIFICATION_LEVELS = [
  { label: 'All', value: -1 },
  { label: 'Verified', value: 1 },
  { label: 'Trusted', value: 2 },
] as const;

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */
const MOCK_REVIEWS: Review[] = Array.from({ length: 8 }, (_, i) => ({
  id: `mock-review-${i}`,
  nodeId: `node-${i}`,
  author: ['DragonSlayer', 'CriticalGamer', 'RPG_Sage', 'ActionFan99', 'SoulsBorne_Vet', 'JRPG_Master', 'TacticalOps', 'CasualKing'][i],
  gameTag: ['ELDEN_RING', 'BG3', 'FF7_REBIRTH', 'STELLAR_BLADE', 'SEKIRO', 'PERSONA_5R', 'HELLDIVERS_2', 'PALWORLD'][i],
  rating: [92, 95, 88, 84, 96, 94, 87, 79][i],
  categoryRatings: [85, 90, 88, 92, 80],
  contentHash: '',
  walrusBlobId: '',
  verifiedPlaytimeHours: [240, 180, 95, 62, 310, 150, 120, 45][i],
  verificationLevel: [2, 2, 1, 1, 2, 1, 1, 0][i],
  helpfulCount: [347, 512, 198, 89, 623, 441, 267, 54][i],
  totalViews: String([18400, 31200, 9800, 5600, 42100, 27800, 15300, 3200][i]),
  totalEarned: '0',
  createdAt: new Date(Date.now() - i * 86400000 * 5).toISOString(),
}));

const RANK_LABELS: Record<number, { label: string; color: string }> = {
  0: { label: 'Unverified', color: 'text-pn-muted' },
  1: { label: 'Verified', color: 'text-pn-green' },
  2: { label: 'Trusted', color: 'text-pn-cyan' },
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function ReviewsPage() {
  const [gameFilter, setGameFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState(0);
  const [verificationFilter, setVerificationFilter] = useState(-1);

  const { data: apiReviews, loading } = useApi(
    () => api.getReviews({ take: 20, gameTag: gameFilter || undefined }),
    [gameFilter],
  );

  const reviews = apiReviews && apiReviews.length > 0 ? apiReviews : MOCK_REVIEWS;

  // Client-side filtering
  const filtered = reviews.filter((r) => {
    if (ratingFilter > 0 && r.rating < ratingFilter * 10) return false;
    if (verificationFilter >= 0 && r.verificationLevel < verificationFilter) return false;
    return true;
  });

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
      <div className="pointer-events-none absolute left-1/2 top-0 z-0 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-pn-cyan/5 blur-[120px]" />

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
              ALL REVIEWS
            </h1>
            <p className="mt-2 text-pn-muted text-lg">
              Verified game reviews from real players
            </p>
          </motion.div>

          {/* Filter bar */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8"
          >
            {/* Game filter */}
            <div className="relative">
              <input
                type="text"
                value={gameFilter}
                onChange={(e) => setGameFilter(e.target.value)}
                placeholder="Filter by game..."
                className="bg-pn-surface border border-pn-border rounded-lg px-4 py-2 text-sm text-pn-text placeholder:text-pn-muted/60 w-full sm:w-[200px] focus:outline-none focus:border-pn-cyan/50 transition-colors"
              />
            </div>

            {/* Rating filter pills */}
            <div className="flex gap-2">
              {RATING_FILTERS.map((rf) => (
                <button
                  key={rf.value}
                  onClick={() => setRatingFilter(rf.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    ratingFilter === rf.value
                      ? 'bg-pn-cyan/20 text-pn-cyan border border-pn-cyan/30'
                      : 'bg-pn-surface border border-pn-border text-pn-muted hover:text-pn-white hover:border-pn-border-light'
                  }`}
                >
                  {rf.label}
                </button>
              ))}
            </div>

            {/* Verification level */}
            <div className="relative">
              <select
                value={verificationFilter}
                onChange={(e) => setVerificationFilter(Number(e.target.value))}
                className="appearance-none bg-pn-surface border border-pn-border rounded-lg px-4 py-2 pr-8 text-sm text-pn-text cursor-pointer hover:border-pn-border-light transition-colors focus:outline-none focus:border-pn-cyan/50"
              >
                {VERIFICATION_LEVELS.map((vl) => (
                  <option key={vl.value} value={vl.value}>
                    {vl.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-pn-muted pointer-events-none" />
            </div>
          </motion.div>

          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 text-pn-cyan animate-spin" />
            </div>
          )}

          {/* Grid */}
          {!loading && (
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 lg:grid-cols-2 gap-4"
            >
              {filtered.map((review) => {
                const rank = RANK_LABELS[review.verificationLevel] ?? RANK_LABELS[0];

                return (
                  <motion.a
                    key={review.id}
                    href={`/review/${review.id}`}
                    variants={fadeUp}
                  >
                    <Card className="!p-5 group cursor-pointer hover:border-pn-border-light transition-colors h-full">
                      <div className="flex gap-4">
                        {/* Rating circle */}
                        <div className="shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-pn-cyan/10 border border-pn-cyan/20">
                          <span className="font-mono text-2xl font-bold text-pn-cyan leading-none">
                            {review.rating}
                          </span>
                          <span className="font-mono text-[8px] uppercase tracking-wider text-pn-cyan/60 mt-0.5">
                            / 100
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Badge + game tag */}
                          <div className="flex items-center gap-2 mb-1.5">
                            <Badge variant="review">REVIEW</Badge>
                            <span className="inline-flex items-center rounded-md bg-pn-amber/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-pn-amber">
                              {review.gameTag}
                            </span>
                          </div>

                          {/* Game title as main heading */}
                          <h3 className="text-base font-semibold text-pn-white leading-snug group-hover:text-pn-cyan transition-colors">
                            {review.gameTag.replace(/_/g, ' ')}
                          </h3>

                          {/* Author + verification */}
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-sm text-pn-text">
                              {review.node?.displayName || review.author}
                            </span>
                            <span className={`inline-flex items-center gap-1 text-[10px] font-mono ${rank.color}`}>
                              <ShieldCheck className="h-3 w-3" />
                              {rank.label}
                            </span>
                          </div>

                          {/* Meta row */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5 text-[11px] text-pn-muted">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {review.verifiedPlaytimeHours}h playtime
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <ThumbsUp className="h-3 w-3" />
                              {review.helpfulCount} helpful
                            </span>
                            <span>
                              {formatViews(review.totalViews)} views
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
          {!loading && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-pn-muted text-lg">No reviews found</p>
              <p className="text-pn-muted/60 text-sm mt-1">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
