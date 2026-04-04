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
  Star,
  Coffee,
} from 'lucide-react';
import { Badge, Button, Card } from '@/components/common';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import ContentCard from '@/components/feed/ContentCard';
import { api, formatViews } from '@/lib/api';
import { useApi } from '@/hooks/useApi';
import { useWallet } from '@/components/providers/SuiProvider';

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
    body: "Shadow of the Erdtree is the most ambitious expansion FromSoftware has ever created. The vast Shadow Lands are filled with secrets hidden between the main story, and encounters with new NPCs add depth to the Elden Ring universe.",
  },
  {
    heading: 'Evolution of the Combat System',
    body: "New weapon categories and combat arts bring a fresh twist to existing builds. The dual-wielding system and light weapon stances in particular elevate the depth of action to a new level.",
  },
  {
    heading: 'Visuals and Sound',
    body: "The ray-traced landscapes of the Shadow Lands are breathtakingly beautiful. From twilight-bathed fields and fortresses shrouded in red mist to the fluorescent caves of the underground world -- the art direction of each area is near-perfect.",
  },
  {
    heading: 'Final Verdict',
    body: "Over 842 hours of playtime, Shadow of the Erdtree never once felt boring. It is a must-play DLC for anyone who loved the base game, and I can confidently call it the best expansion of the year.",
  },
];

const RELATED_REVIEWS = [
  {
    id: 'rel-r1',
    title: 'Stellar Blade Review',
    author: 'GameHunter_KR',
    gameTag: 'STELLAR_BLADE',
    rating: 82,
    views: '14200',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'rel-r2',
    title: 'Black Myth: Wukong In-Depth Review',
    author: 'RPG_Master',
    gameTag: 'BLACK_MYTH_WUKONG',
    rating: 90,
    views: '28700',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: 'rel-r3',
    title: 'Armored Core VI Complete Analysis',
    author: 'MechaPilot',
    gameTag: 'ARMORED_CORE_6',
    rating: 85,
    views: '11300',
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
  },
];

/* ------------------------------------------------------------------ */
/*  Rating Bar                                                         */
/* ------------------------------------------------------------------ */
const RatingBar: FC<{
  label: string;
  score: number;
  color: string;
  delay: number;
}> = ({ label, score, color, delay }) => (
  <div className="flex items-center gap-3">
    <span className="w-[72px] text-xs font-medium text-pn-muted shrink-0 text-right">{label}</span>
    <div className="flex-1 h-2 bg-pn-surface-2 rounded-full overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${(score / 10) * 100}%` }}
        transition={{ duration: 0.8, delay, ease: 'easeOut' }}
      />
    </div>
    <span className="font-mono text-xs font-bold text-pn-white w-8 text-right">
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
  const { connected, connect } = useWallet();

  // Fetch live data from API
  const { data: apiReview } = useApi(() => api.getReview(reviewId), [reviewId]);

  const displayReview = apiReview
    ? {
        ...review,
        title: apiReview.gameTag ? `${apiReview.gameTag.replace(/_/g, ' ')} Review` : review.title,
        game: apiReview.gameTag || review.game,
        overall: apiReview.rating / 10,
        verification: {
          ...review.verification,
          playtime: apiReview.verifiedPlaytimeHours,
        },
        helpful: apiReview.helpfulCount,
        date: String(apiReview.createdAt ?? '').slice(0, 10),
        categories: (() => {
          const raw = apiReview.categoryRatings;
          const arr = Array.isArray(raw) ? raw : (typeof raw === 'object' && raw ? Object.values(raw) : []);
          return arr.length >= 5
            ? arr.slice(0, 5).map((score: any, i: number) => ({
                label: review.categories[i]?.label || `Category ${i + 1}`,
                score: Number(score) / 10,
                color: Number(score) / 10 >= 8 ? 'bg-pn-cyan' : 'bg-pn-amber',
              }))
            : review.categories;
        })(),
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
    fetch(`/api/reviews/${reviewId}/helpful`, { method: 'POST' }).catch(() => {});
  };

  return (
    <div className="min-h-screen bg-pn-black">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-0 lg:ml-56 pt-16">
          <div className="flex flex-col lg:flex-row gap-6 px-4 lg:px-6 py-6">
            {/* ========================================================= */}
            {/* Main Column                                                */}
            {/* ========================================================= */}
            <div className="flex-1 min-w-0 space-y-6">
              {/* Game tag + badge */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-md bg-pn-amber/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-pn-amber">
                  {displayReview.game}
                </span>
                <Badge variant="review">REVIEW</Badge>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-bold text-pn-white leading-tight">
                {displayReview.title}
              </h1>

              {/* Verification badge */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-pn-cyan" />
                  <span className="font-mono font-bold text-pn-cyan">
                    {displayReview.verification.playtime} hrs
                  </span>
                  <span className="text-pn-muted">Verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-pn-muted" />
                  <span className="text-pn-text">
                    {displayReview.verification.platform}
                  </span>
                </div>
                <span className="text-xs text-pn-muted">{displayReview.date}</span>
              </div>

              {/* Curator bar */}
              <div className="flex items-center gap-3 py-3 border-y border-pn-border">
                <div className="w-10 h-10 rounded-full bg-pn-surface-2 border border-pn-border flex items-center justify-center">
                  <span className="font-mono text-xs text-pn-cyan">
                    {review.author.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-pn-white">
                      {review.author.name}
                    </span>
                    {review.author.verified && (
                      <CheckCircle className="w-3.5 h-3.5 text-pn-cyan" />
                    )}
                    <span className="font-mono text-[10px] text-pn-muted uppercase tracking-wider">
                      {review.author.tier} Reviewer
                    </span>
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    if (!connected) { connect(); return; }
                    alert('Subscribed!');
                  }}
                >
                  Subscribe
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    if (!connected) { connect(); return; }
                    const amount = prompt('Enter tip amount in USDC (e.g. 1.00):');
                    if (amount) alert(`Ping of $${amount} USDC sent!`);
                  }}
                >
                  <Coffee className="h-3.5 w-3.5" />
                  Ping $
                </Button>
              </div>

              {/* Overall Rating */}
              <Card>
                <div className="flex items-start gap-6 p-2">
                  {/* Score circle */}
                  <div className="relative flex-shrink-0 w-[100px] h-[100px]">
                    <svg width="100" height="100" viewBox="0 0 100 100">
                      <circle
                        cx="50" cy="50" r="42"
                        fill="none" stroke="currentColor"
                        className="text-pn-surface-2" strokeWidth="5"
                      />
                      <motion.circle
                        cx="50" cy="50" r="42"
                        fill="none" stroke="currentColor"
                        className="text-pn-cyan" strokeWidth="5"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 42}
                        strokeDashoffset={2 * Math.PI * 42}
                        animate={{
                          strokeDashoffset:
                            2 * Math.PI * 42 * (1 - displayReview.overall / 10),
                        }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                        style={{
                          transformOrigin: '50px 50px',
                          transform: 'rotate(-90deg)',
                        }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-mono text-3xl font-bold text-pn-cyan leading-none">
                        {displayReview.overall.toFixed(1)}
                      </span>
                      <span className="font-mono text-[10px] text-pn-muted mt-0.5">/ 10</span>
                    </div>
                  </div>

                  {/* Category bars */}
                  <div className="flex-1 space-y-2.5 pt-1">
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

              {/* Review Content */}
              <div className="space-y-6">
                {reviewContent.map((section, i) => (
                  <div key={i} className="space-y-3">
                    <h2 className="text-pn-white text-lg font-bold flex items-center gap-2">
                      <span className="w-1 h-5 rounded-full bg-pn-cyan inline-block" />
                      {section.heading}
                    </h2>
                    <p className="text-pn-text text-sm leading-relaxed pl-3">
                      {section.body}
                    </p>
                  </div>
                ))}
              </div>

              {/* Helpful Section */}
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
                    <button
                      onClick={() => handleHelpful('up')}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors font-mono text-xs ${
                        helpful === 'up'
                          ? 'bg-pn-green/10 border-pn-green/30 text-pn-green'
                          : 'bg-pn-surface-2 border-pn-border text-pn-muted hover:text-pn-text hover:border-pn-border-light'
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      Helpful
                    </button>
                    <button
                      onClick={() => handleHelpful('down')}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors font-mono text-xs ${
                        helpful === 'down'
                          ? 'bg-pn-red/10 border-pn-red/30 text-pn-red'
                          : 'bg-pn-surface-2 border-pn-border text-pn-muted hover:text-pn-text hover:border-pn-border-light'
                      }`}
                    >
                      <ThumbsDown className="w-4 h-4" />
                      No
                    </button>
                  </div>
                </div>
              </Card>
            </div>

            {/* ========================================================= */}
            {/* Right Sidebar                                              */}
            {/* ========================================================= */}
            <div className="w-full lg:w-[360px] shrink-0 space-y-4">
              <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-pn-muted">
                Related Reviews
              </h3>
              {RELATED_REVIEWS.map((r) => (
                <ContentCard
                  key={r.id}
                  type="review"
                  id={r.id}
                  title={r.title}
                  gameTag={r.gameTag}
                  author={r.author}
                  views={formatViews(r.views)}
                  rating={r.rating / 10}
                  createdAt={r.createdAt}
                />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReviewPage;
