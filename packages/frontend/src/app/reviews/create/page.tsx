'use client';

import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import {
  Star,
  Gamepad2,
  Monitor,
  Swords,
  Trophy,
  Coins,
  Shield,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card } from '@/components/common';
import { useWallet } from '@/components/providers/SuiProvider';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const PLATFORMS = [
  { label: 'Steam', value: 'steam' },
  { label: 'Riot', value: 'riot' },
  { label: 'Xbox', value: 'xbox' },
] as const;

const CATEGORY_RATINGS = [
  { key: 'story', label: 'Story', icon: Gamepad2, color: 'from-violet-500 to-violet-400' },
  { key: 'graphics', label: 'Graphics', icon: Monitor, color: 'from-blue-500 to-blue-400' },
  { key: 'combat', label: 'Combat', icon: Swords, color: 'from-red-500 to-red-400' },
  { key: 'endgame', label: 'Endgame', icon: Trophy, color: 'from-amber-500 to-amber-400' },
  { key: 'value', label: 'Value', icon: Coins, color: 'from-emerald-500 to-emerald-400' },
] as const;

type CategoryKey = (typeof CATEGORY_RATINGS)[number]['key'];

/* ------------------------------------------------------------------ */
/*  Animation helpers                                                  */
/* ------------------------------------------------------------------ */
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.45, ease: 'easeOut' },
  }),
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function CreateReviewPage() {
  const { connected, connect } = useWallet();

  /* Form state */
  const [game, setGame] = useState('');
  const [overallRating, setOverallRating] = useState(5.0);
  const [categoryScores, setCategoryScores] = useState<Record<CategoryKey, number>>({
    story: 5,
    graphics: 5,
    combat: 5,
    endgame: 5,
    value: 5,
  });
  const [platform, setPlatform] = useState<string>('');
  const [verified, setVerified] = useState(false);
  const [reviewContent, setReviewContent] = useState('');

  /* Validation */
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const updateCategoryScore = (key: CategoryKey, value: number) => {
    setCategoryScores((prev) => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!game.trim()) errs.game = 'Game is required';
    if (!reviewContent.trim()) errs.content = 'Review content is required';
    return errs;
  };

  const handleVerify = () => {
    if (!platform) {
      alert('Please select a platform first.');
      return;
    }
    alert(
      `This will connect to the ${platform.charAt(0).toUpperCase() + platform.slice(1)} API to verify your playtime. This feature is coming soon.`,
    );
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!connected) {
      connect();
      return;
    }

    const errs = validate();
    setErrors(errs);

    if (Object.keys(errs).length === 0) {
      setSubmitted(true);
    }
  };

  const inputClass =
    'w-full bg-pn-surface border border-pn-border rounded-lg px-4 py-3 text-pn-white placeholder:text-pn-muted focus:border-pn-green focus:outline-none transition-colors';

  /* ---------------------------------------------------------------- */
  /*  Success state                                                    */
  /* ---------------------------------------------------------------- */
  if (submitted) {
    return (
      <div className="min-h-screen bg-pn-black flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-center max-w-md"
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-cyan-500/20 flex items-center justify-center">
              <Star className="h-8 w-8 text-cyan-400" />
            </div>
            <h2 className="text-2xl font-bold text-pn-white mb-3">
              Review published!
            </h2>
            <p className="text-pn-muted mb-2">
              Your review for <span className="text-pn-white font-medium">{game}</span>{' '}
              is now live.
            </p>
            <p className="text-pn-muted text-sm mb-6">
              Overall score:{' '}
              <span className="font-mono text-cyan-400 font-bold text-lg">
                {overallRating.toFixed(1)}
              </span>
            </p>
            <div className="flex gap-3 justify-center">
              <a
                href="/reviews"
                className="px-5 py-2.5 rounded-lg bg-pn-surface border border-pn-border text-sm font-medium text-pn-text hover:text-pn-white hover:border-pn-border-light transition-colors"
              >
                Browse Reviews
              </a>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setGame('');
                  setOverallRating(5.0);
                  setCategoryScores({ story: 5, graphics: 5, combat: 5, endgame: 5, value: 5 });
                  setPlatform('');
                  setVerified(false);
                  setReviewContent('');
                }}
                className="px-5 py-2.5 rounded-lg bg-cyan-500 text-pn-black text-sm font-bold hover:brightness-110 transition-all"
              >
                Write Another
              </button>
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Form                                                             */
  /* ---------------------------------------------------------------- */
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
      <div className="pointer-events-none absolute left-1/2 top-0 z-0 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-cyan-500/5 blur-[120px]" />

      <main className="relative z-10 flex-1">
        <div className="max-w-3xl mx-auto px-4 lg:px-6 pt-12 pb-20">
          {/* Heading */}
          <motion.div
            custom={0}
            variants={fadeIn}
            initial="hidden"
            animate="show"
            className="mb-10"
          >
            <h1 className="font-primary text-3xl sm:text-4xl font-extrabold text-pn-white tracking-tight">
              WRITE REVIEW
            </h1>
            <p className="mt-2 text-pn-muted">
              Share your honest opinion and help other players decide.
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            {/* Game */}
            <motion.div custom={1} variants={fadeIn} initial="hidden" animate="show">
              <label className="block text-sm font-medium text-pn-text mb-2">
                Game
              </label>
              <input
                type="text"
                value={game}
                onChange={(e) => setGame(e.target.value)}
                placeholder="What game are you reviewing?"
                className={`${inputClass} ${errors.game ? '!border-red-500' : ''}`}
              />
              {errors.game && (
                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.game}
                </p>
              )}
            </motion.div>

            {/* Overall Rating */}
            <motion.div custom={2} variants={fadeIn} initial="hidden" animate="show">
              <label className="block text-sm font-medium text-pn-text mb-4">
                Overall Rating
              </label>
              <Card className="!p-6">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Big score display */}
                  <div className="flex-shrink-0 text-center">
                    <span className="font-mono text-6xl font-bold text-cyan-400 leading-none">
                      {overallRating.toFixed(1)}
                    </span>
                    <p className="text-xs text-pn-muted mt-1 font-mono">/10.0</p>
                  </div>

                  {/* Slider */}
                  <div className="flex-1 w-full">
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={overallRating * 10}
                      onChange={(e) =>
                        setOverallRating(parseInt(e.target.value) / 10)
                      }
                      className="w-full h-2 rounded-full appearance-none cursor-pointer bg-pn-dark accent-cyan-400"
                      style={{
                        background: `linear-gradient(to right, rgb(34 211 238) 0%, rgb(34 211 238) ${
                          ((overallRating - 0.1) / 9.9) * 100
                        }%, rgb(30 30 36) ${
                          ((overallRating - 0.1) / 9.9) * 100
                        }%, rgb(30 30 36) 100%)`,
                      }}
                    />
                    <div className="flex justify-between mt-2">
                      <span className="text-[10px] font-mono text-pn-muted">1.0</span>
                      <span className="text-[10px] font-mono text-pn-muted">10.0</span>
                    </div>
                  </div>
                </div>

                {/* Clickable scale dots */}
                <div className="flex justify-between mt-4 gap-1">
                  {Array.from({ length: 10 }, (_, i) => {
                    const val = i + 1;
                    const active = overallRating >= val;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setOverallRating(val)}
                        className={`flex-1 py-2 rounded-lg text-xs font-mono font-bold transition-colors ${
                          active
                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                            : 'bg-pn-dark text-pn-muted border border-pn-border hover:border-pn-border-light'
                        }`}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              </Card>
            </motion.div>

            {/* Category Ratings */}
            <motion.div custom={3} variants={fadeIn} initial="hidden" animate="show">
              <label className="block text-sm font-medium text-pn-text mb-4">
                Category Ratings
              </label>
              <div className="flex flex-col gap-3">
                {CATEGORY_RATINGS.map((cat) => {
                  const Icon = cat.icon;
                  const score = categoryScores[cat.key];
                  const pct = (score / 10) * 100;

                  return (
                    <Card key={cat.key} className="!p-4">
                      <div className="flex items-center gap-4">
                        {/* Icon + label */}
                        <div className="flex items-center gap-2.5 w-28 flex-shrink-0">
                          <Icon className="h-4 w-4 text-pn-muted" />
                          <span className="text-sm text-pn-text font-medium">
                            {cat.label}
                          </span>
                        </div>

                        {/* Progress bar + slider */}
                        <div className="flex-1 relative">
                          {/* Background track */}
                          <div className="h-2 rounded-full bg-pn-dark overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full bg-gradient-to-r ${cat.color}`}
                              initial={{ width: '50%' }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.2 }}
                            />
                          </div>
                          {/* Range input overlay */}
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={score * 10}
                            onChange={(e) =>
                              updateCategoryScore(
                                cat.key,
                                parseInt(e.target.value) / 10,
                              )
                            }
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        </div>

                        {/* Score */}
                        <span className="font-mono text-sm font-bold text-pn-white w-10 text-right">
                          {score.toFixed(1)}
                        </span>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </motion.div>

            {/* Playtime Verification */}
            <motion.div custom={4} variants={fadeIn} initial="hidden" animate="show">
              <label className="block text-sm font-medium text-pn-text mb-4">
                Playtime Verification
              </label>
              <Card className="!p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {/* Platform selector */}
                  <div className="flex gap-2">
                    {PLATFORMS.map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setPlatform(p.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          platform === p.value
                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                            : 'bg-pn-dark border border-pn-border text-pn-muted hover:text-pn-white hover:border-pn-border-light'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  {/* Connect button */}
                  <button
                    type="button"
                    onClick={handleVerify}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-pn-surface border border-pn-border text-sm font-medium text-pn-text hover:text-pn-white hover:border-pn-border-light transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Connect &amp; Verify
                  </button>
                </div>

                {/* Verification badge */}
                <div className="mt-4 flex items-center gap-2">
                  {verified ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-pn-green" />
                      <span className="text-xs font-medium text-pn-green">
                        Verified
                      </span>
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 text-pn-muted" />
                      <span className="text-xs font-medium text-pn-muted">
                        Unverified
                      </span>
                      <span className="text-[10px] text-pn-muted/60 ml-1">
                        &mdash; Connect a platform to verify your playtime
                      </span>
                    </>
                  )}
                </div>
              </Card>
            </motion.div>

            {/* Review Content */}
            <motion.div custom={5} variants={fadeIn} initial="hidden" animate="show">
              <label className="block text-sm font-medium text-pn-text mb-2">
                Review Content
              </label>
              <textarea
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
                placeholder="Write your honest review..."
                className={`${inputClass} min-h-[300px] resize-y text-sm leading-relaxed ${
                  errors.content ? '!border-red-500' : ''
                }`}
              />
              <div className="flex items-center justify-between mt-1.5">
                {errors.content ? (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.content}
                  </p>
                ) : (
                  <span />
                )}
                <span className="text-xs text-pn-muted font-mono">
                  {reviewContent.length.toLocaleString()} characters
                </span>
              </div>
            </motion.div>

            {/* Submit */}
            <motion.div custom={6} variants={fadeIn} initial="hidden" animate="show">
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-cyan-500 text-pn-black text-sm font-bold hover:brightness-110 transition-all active:scale-[0.98]"
              >
                {connected ? 'Publish Review' : 'Connect Wallet to Publish'}
              </button>
            </motion.div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
