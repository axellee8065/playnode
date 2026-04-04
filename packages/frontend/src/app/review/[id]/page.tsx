'use client';

import { type FC, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
  Clock,
  Monitor,
  ExternalLink,
  Star,
  ChevronRight,
} from 'lucide-react';
import { Badge, Button, Card } from '@/components/common';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { api, formatViews } from '@/lib/api';
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
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const review = {
  title: 'Elden Ring: Shadow of the Erdtree Complete Review',
  game: 'Elden Ring: Shadow of the Erdtree',
  author: {
    name: 'SoulsMaster_KR',
    avatar: null,
    verified: true,
    tier: 'Expert',
    drops: 42,
    followers: '12.8K',
  },
  verification: {
    playtime: 842,
    platform: 'Steam',
    badge: 'EXPERT',
  },
  overall: 8.7,
  categories: [
    { label: 'Story', score: 9.2, color: 'bg-pn-cyan' },
    { label: 'Graphics', score: 9.5, color: 'bg-pn-cyan' },
    { label: 'Combat', score: 8.8, color: 'bg-pn-cyan' },
    { label: 'Endgame', score: 7.5, color: 'bg-pn-amber' },
    { label: 'Value', score: 8.5, color: 'bg-pn-cyan' },
  ],
  helpful: 1247,
  date: '2026-03-18',
};

const reviewContent = [
  {
    heading: 'A New Challenge in the Shadow Lands',
    body: 'Shadow of the Erdtree is the most ambitious expansion FromSoftware has ever created. The vast Shadow Lands are filled with secrets hidden between the main story, and encounters with new NPCs add depth to the Elden Ring universe. Messmer\'s story explores the other side of Marika and the Golden Order, offering a fresh perspective on themes that run through the entire series.',
  },
  {
    heading: 'Evolution of the Combat System',
    body: 'New weapon categories and combat arts bring a fresh twist to existing builds. The dual-wielding system and light weapon stances in particular elevate the depth of action to a new level. Boss fights remain challenging, but the DLC-exclusive Scadutree leveling system makes the difficulty curve feel smoother. However, some late-game boss patterns feeling repetitive is a minor disappointment.',
  },
  {
    heading: 'Visuals and Sound',
    body: 'The ray-traced landscapes of the Shadow Lands are breathtakingly beautiful. From twilight-bathed fields and fortresses shrouded in red mist to the fluorescent caves of the underground world -- the art direction of each area is near-perfect. The soundtrack also features an expanded orchestral arrangement that maximizes the tension of boss encounters.',
  },
  {
    heading: 'Final Verdict',
    body: 'Over 842 hours of playtime, Shadow of the Erdtree never once felt boring. It is a must-play DLC for anyone who loved the base game, and I can confidently call it the best expansion of the year. Endgame content repetitiveness and some balance issues kept me from giving a perfect score, but it remains a top-tier gaming experience nonetheless.',
  },
];

const relatedReviews = [
  { title: 'Stellar Blade — A New Standard for Action', author: 'GameHunter_KR', score: 8.2 },
  { title: 'Black Myth: Wukong In-Depth Review', author: 'RPG_Master', score: 9.0 },
  { title: 'Armored Core VI Complete Analysis', author: 'MechaPilot', score: 8.5 },
];

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

const RatingBar: FC<{
  label: string;
  score: number;
  color: string;
  delay: number;
}> = ({ label, score, color, delay }) => (
  <div className="flex items-center gap-4">
    <span className="w-20 text-sm text-pn-text shrink-0">{label}</span>
    <div className="flex-1 h-3 bg-pn-surface-2 rounded-full overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${(score / 10) * 100}%` }}
        transition={{ duration: 0.8, delay, ease: 'easeOut' }}
      />
    </div>
    <span className="font-mono text-sm font-bold text-pn-white w-8 text-right">
      {score.toFixed(1)}
    </span>
  </div>
);

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

const ReviewPage: FC = () => {
  const params = useParams();
  const reviewId = params.id as string;

  // Fetch live data from API
  const { data: apiReview } = useApi(() => api.getReview(reviewId), [reviewId]);

  // Map API review to display values, fall back to mock
  const displayReview = apiReview
    ? {
        ...review,
        title: apiReview.gameTag ? `${apiReview.gameTag} Review` : review.title,
        game: apiReview.gameTag || review.game,
        overall: apiReview.rating / 10,
        verification: {
          ...review.verification,
          playtime: apiReview.verifiedPlaytimeHours,
        },
        helpful: apiReview.helpfulCount,
        date: String(apiReview.createdAt).slice(0, 10),
        categories: apiReview.categoryRatings?.length
          ? apiReview.categoryRatings.map((score: number, i: number) => ({
              label: review.categories[i]?.label || `Category ${i + 1}`,
              score: score / 10,
              color: score / 10 >= 8 ? 'bg-pn-cyan' : 'bg-pn-amber',
            }))
          : review.categories,
      }
    : review;

  const [helpful, setHelpful] = useState<'up' | 'down' | null>(null);
  const [helpfulCount, setHelpfulCount] = useState(displayReview.helpful);

  const handleHelpful = (vote: 'up' | 'down') => {
    if (helpful === vote) {
      setHelpful(null);
      if (vote === 'up') setHelpfulCount(review.helpful);
    } else {
      setHelpful(vote);
      if (vote === 'up') setHelpfulCount(review.helpful + 1);
      else setHelpfulCount(review.helpful);
    }
    // Fire-and-forget API call to persist the vote
    fetch(`/api/reviews/${reviewId}/helpful`, { method: 'POST' }).catch(() => {});
  };

  return (
    <div className="min-h-screen bg-pn-black">
      <Header />
      <main className="max-w-[1200px] mx-auto px-4 lg:px-6 py-10">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8"
        >
          {/* ========================================================= */}
          {/* Main Column                                                */}
          {/* ========================================================= */}
          <div className="space-y-6">
            {/* ---- Header ---- */}
            <motion.div variants={fadeUp}>
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="review">REVIEW</Badge>
                <span className="font-mono text-[10px] text-pn-muted uppercase tracking-wider">
                  {displayReview.date}
                </span>
              </div>
              <h1 className="text-pn-white text-2xl sm:text-3xl font-bold leading-tight mb-4">
                {displayReview.title}
              </h1>
              <div className="flex items-center gap-3">
                {/* Author avatar placeholder */}
                <div className="w-10 h-10 rounded-full bg-pn-surface-2 border border-pn-border flex items-center justify-center">
                  <span className="font-mono text-xs text-pn-cyan">
                    {review.author.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-pn-white">
                      {review.author.name}
                    </span>
                    {review.author.verified && (
                      <CheckCircle className="w-3.5 h-3.5 text-pn-cyan" />
                    )}
                  </div>
                  <span className="font-mono text-[10px] text-pn-muted uppercase tracking-wider">
                    {review.author.tier} Reviewer
                  </span>
                </div>
              </div>
            </motion.div>

            {/* ---- Verification Banner ---- */}
            <motion.div variants={fadeUp}>
              <div className="rounded-xl border border-pn-cyan/20 bg-pn-cyan/5 p-5">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-pn-cyan" />
                    <span className="font-mono text-lg font-bold text-pn-cyan">
                      {displayReview.verification.playtime} hrs
                    </span>
                    <span className="text-sm text-pn-text">Verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-md px-2 py-0.5 font-mono uppercase tracking-wider text-pn-cyan bg-pn-cyan/15 border border-pn-cyan/30"
                      style={{ fontSize: '9px', lineHeight: '16px' }}
                    >
                      {displayReview.verification.badge}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-pn-muted" />
                    <span className="text-sm text-pn-text">
                      {displayReview.verification.platform}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-pn-muted uppercase tracking-wider">
                    Verified Playtime
                  </span>
                </div>
              </div>
            </motion.div>

            {/* ---- Overall Rating ---- */}
            <motion.div variants={fadeUp}>
              <Card>
                <div className="flex flex-col sm:flex-row items-center gap-8">
                  {/* Score circle */}
                  <div className="relative flex-shrink-0">
                    <svg width="120" height="120" viewBox="0 0 120 120">
                      <circle
                        cx="60"
                        cy="60"
                        r="52"
                        fill="none"
                        stroke="currentColor"
                        className="text-pn-surface-2"
                        strokeWidth="6"
                      />
                      <motion.circle
                        cx="60"
                        cy="60"
                        r="52"
                        fill="none"
                        stroke="currentColor"
                        className="text-pn-cyan"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 52}
                        strokeDashoffset={2 * Math.PI * 52}
                        animate={{
                          strokeDashoffset:
                            2 * Math.PI * 52 * (1 - displayReview.overall / 10),
                        }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                        style={{
                          transformOrigin: '60px 60px',
                          transform: 'rotate(-90deg)',
                        }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-mono text-5xl font-bold text-pn-cyan leading-none">
                        {displayReview.overall.toFixed(1)}
                      </span>
                      <span className="font-mono text-xs text-pn-muted mt-1">
                        / 10
                      </span>
                    </div>
                  </div>

                  {/* Category bars */}
                  <div className="flex-1 w-full space-y-3">
                    {displayReview.categories.map((cat, i) => (
                      <RatingBar
                        key={cat.label}
                        label={cat.label}
                        score={cat.score}
                        color={cat.color}
                        delay={0.3 + i * 0.1}
                      />
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* ---- Review Content ---- */}
            <motion.div variants={fadeUp} className="space-y-6">
              {reviewContent.map((section, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="space-y-3"
                >
                  <h2 className="text-pn-white text-lg font-bold flex items-center gap-2">
                    <span className="w-1 h-5 rounded-full bg-pn-cyan inline-block" />
                    {section.heading}
                  </h2>
                  <p className="text-pn-text text-sm leading-relaxed pl-3">
                    {section.body}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            {/* ---- Helpful Section ---- */}
            <motion.div variants={fadeUp}>
              <Card>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <p className="text-pn-white text-sm font-medium mb-1">
                      Was this review helpful?
                    </p>
                    <p className="font-mono text-[11px] text-pn-muted">
                      {helpfulCount.toLocaleString()} people found this helpful
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleHelpful('up')}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors font-mono text-xs ${
                        helpful === 'up'
                          ? 'bg-pn-green/10 border-pn-green/30 text-pn-green'
                          : 'bg-pn-surface-2 border-pn-border text-pn-muted hover:text-pn-text hover:border-pn-border-light'
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      Helpful
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleHelpful('down')}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors font-mono text-xs ${
                        helpful === 'down'
                          ? 'bg-pn-red/10 border-pn-red/30 text-pn-red'
                          : 'bg-pn-surface-2 border-pn-border text-pn-muted hover:text-pn-text hover:border-pn-border-light'
                      }`}
                    >
                      <ThumbsDown className="w-4 h-4" />
                      No
                    </motion.button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* ========================================================= */}
          {/* Sidebar                                                    */}
          {/* ========================================================= */}
          <div className="space-y-6">
            {/* Author Card */}
            <motion.div variants={fadeUp}>
              <Card>
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-pn-surface-2 border border-pn-border flex items-center justify-center mb-3">
                    <span className="font-mono text-xl text-pn-cyan">
                      {review.author.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-sm font-semibold text-pn-white">
                      {review.author.name}
                    </span>
                    {review.author.verified && (
                      <CheckCircle className="w-3.5 h-3.5 text-pn-cyan" />
                    )}
                  </div>
                  <span className="font-mono text-[10px] text-pn-muted uppercase tracking-wider mb-4">
                    {review.author.tier} Reviewer
                  </span>
                  <div className="w-full grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-pn-surface-2 rounded-lg p-2.5">
                      <div className="font-mono text-sm font-bold text-pn-white">
                        {review.author.drops}
                      </div>
                      <div className="font-mono text-[9px] text-pn-muted uppercase">
                        Drops
                      </div>
                    </div>
                    <div className="bg-pn-surface-2 rounded-lg p-2.5">
                      <div className="font-mono text-sm font-bold text-pn-white">
                        {review.author.followers}
                      </div>
                      <div className="font-mono text-[9px] text-pn-muted uppercase">
                        Followers
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => window.location.href = `/node/${reviewId}`}
                  >
                    View Profile
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* Shop Link */}
            <motion.div variants={fadeUp}>
              <Card>
                <p className="font-mono text-[10px] uppercase tracking-wider text-pn-muted mb-3">
                  Buy This Game
                </p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-pn-white">
                    {displayReview.game}
                  </span>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full"
                  onClick={() => window.location.href = '/shop'}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View in Shop
                </Button>
              </Card>
            </motion.div>

            {/* Related Reviews */}
            <motion.div variants={fadeUp}>
              <Card>
                <p className="font-mono text-[10px] uppercase tracking-wider text-pn-muted mb-4">
                  Related Reviews
                </p>
                <div className="space-y-3">
                  {relatedReviews.map((r) => (
                    <motion.div
                      key={r.title}
                      whileHover={{ x: 2 }}
                      className="flex items-start justify-between gap-3 p-2.5 rounded-lg hover:bg-pn-surface-2/50 transition-colors cursor-pointer group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-pn-text font-medium truncate group-hover:text-pn-white transition-colors">
                          {r.title}
                        </p>
                        <p className="font-mono text-[10px] text-pn-muted mt-0.5">
                          by {r.author}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Star className="w-3 h-3 text-pn-amber fill-pn-amber" />
                        <span className="font-mono text-xs font-bold text-pn-white">
                          {r.score.toFixed(1)}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <motion.button
                  whileHover={{ x: 2 }}
                  className="w-full flex items-center justify-center gap-1 mt-3 pt-3 border-t border-pn-border text-xs text-pn-muted hover:text-pn-cyan transition-colors font-mono"
                >
                  View All Reviews
                  <ChevronRight className="w-3 h-3" />
                </motion.button>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default ReviewPage;
