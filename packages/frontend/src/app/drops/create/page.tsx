'use client';

import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { FileText, Eye, DollarSign, Lock, Unlock, AlertCircle } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Card } from '@/components/common';
import { useWallet } from '@/components/providers/SuiProvider';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const CATEGORIES = [
  { label: 'Boss Guide', value: 'boss' },
  { label: 'Build Guide', value: 'build' },
  { label: 'Quest Guide', value: 'quest' },
  { label: 'Tier List', value: 'tier-list' },
  { label: 'Speedrun Guide', value: 'speedrun' },
  { label: 'General', value: 'general' },
];

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
export default function CreateDropPage() {
  const { connected, connect } = useWallet();

  /* Form state */
  const [title, setTitle] = useState('');
  const [game, setGame] = useState('');
  const [category, setCategory] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [price, setPrice] = useState('');
  const [content, setContent] = useState('');
  const [preview, setPreview] = useState(false);

  /* Validation */
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (!game.trim()) errs.game = 'Game is required';
    if (!category) errs.category = 'Category is required';
    if (!content.trim()) errs.content = 'Content is required';
    if (isPremium) {
      const p = parseFloat(price);
      if (!price || isNaN(p)) errs.price = 'Price is required for premium drops';
      else if (p < 0.99) errs.price = 'Minimum price is 0.99 USDC';
      else if (p > 99.99) errs.price = 'Maximum price is 99.99 USDC';
    }
    return errs;
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

  if (submitted) {
    return (
      <div className="min-h-screen bg-pn-black">
        <Header />
        <main className="pt-16 flex-1 flex items-center justify-center px-4 min-h-[calc(100vh-64px)]">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-center max-w-md"
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-pn-green/20 flex items-center justify-center">
              <FileText className="h-8 w-8 text-pn-green" />
            </div>
            <h2 className="text-2xl font-bold text-pn-white mb-3">
              Drop published!
            </h2>
            <p className="text-pn-muted mb-6">
              Your guide is now live and earning. It has been stamped on-chain
              with your authorship proof.
            </p>
            <div className="flex gap-3 justify-center">
              <a
                href="/drops"
                className="px-5 py-2.5 rounded-lg bg-pn-surface border border-pn-border text-sm font-medium text-pn-text hover:text-pn-white hover:border-pn-border-light transition-colors"
              >
                Browse Drops
              </a>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setTitle('');
                  setGame('');
                  setCategory('');
                  setIsPremium(false);
                  setPrice('');
                  setContent('');
                }}
                className="px-5 py-2.5 rounded-lg bg-pn-green text-pn-black text-sm font-bold hover:brightness-110 transition-all"
              >
                Create Another
              </button>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pn-black">
      <Header />

      <main className="pt-16">
        <div className="max-w-3xl mx-auto px-4 lg:px-6 pt-6 pb-20">
          {/* Heading */}
          <motion.div
            custom={0}
            variants={fadeIn}
            initial="hidden"
            animate="show"
            className="mb-10"
          >
            <h1 className="font-primary text-3xl sm:text-4xl font-extrabold text-pn-white tracking-tight">
              CREATE DROP
            </h1>
            <p className="mt-2 text-pn-muted">
              Write a guide, walkthrough, or tier list and publish it on
              PlayNode.
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Title */}
            <motion.div custom={1} variants={fadeIn} initial="hidden" animate="show">
              <label className="block text-sm font-medium text-pn-text mb-2">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter your guide title"
                className={`${inputClass} ${errors.title ? '!border-red-500' : ''}`}
              />
              {errors.title && (
                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.title}
                </p>
              )}
            </motion.div>

            {/* Game */}
            <motion.div custom={2} variants={fadeIn} initial="hidden" animate="show">
              <label className="block text-sm font-medium text-pn-text mb-2">
                Game
              </label>
              <input
                type="text"
                value={game}
                onChange={(e) => setGame(e.target.value)}
                placeholder="e.g. Monster Hunter Wilds"
                className={`${inputClass} ${errors.game ? '!border-red-500' : ''}`}
              />
              {errors.game && (
                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.game}
                </p>
              )}
            </motion.div>

            {/* Category */}
            <motion.div custom={3} variants={fadeIn} initial="hidden" animate="show">
              <label className="block text-sm font-medium text-pn-text mb-2">
                Category
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`${inputClass} appearance-none cursor-pointer ${
                    !category ? 'text-pn-muted' : ''
                  } ${errors.category ? '!border-red-500' : ''}`}
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <svg
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-pn-muted pointer-events-none"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {errors.category && (
                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.category}
                </p>
              )}
            </motion.div>

            {/* Price */}
            <motion.div custom={4} variants={fadeIn} initial="hidden" animate="show">
              <label className="block text-sm font-medium text-pn-text mb-2">
                Price
              </label>
              <div className="flex items-center gap-3 mb-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsPremium(false);
                    setPrice('');
                  }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    !isPremium
                      ? 'bg-pn-green/20 text-pn-green border border-pn-green/30'
                      : 'bg-pn-surface border border-pn-border text-pn-muted hover:text-pn-white'
                  }`}
                >
                  <Unlock className="h-4 w-4" />
                  Free
                </button>
                <button
                  type="button"
                  onClick={() => setIsPremium(true)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isPremium
                      ? 'bg-pn-green/20 text-pn-green border border-pn-green/30'
                      : 'bg-pn-surface border border-pn-border text-pn-muted hover:text-pn-white'
                  }`}
                >
                  <Lock className="h-4 w-4" />
                  Premium
                </button>
              </div>
              {isPremium && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-pn-muted" />
                    <input
                      type="number"
                      step="0.01"
                      min="0.99"
                      max="99.99"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.99"
                      className={`${inputClass} pl-10 pr-20 ${
                        errors.price ? '!border-red-500' : ''
                      }`}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-mono text-pn-muted">
                      USDC
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-pn-muted">
                    Min 0.99 USDC &middot; Max 99.99 USDC
                  </p>
                  {errors.price && (
                    <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.price}
                    </p>
                  )}
                </motion.div>
              )}
            </motion.div>

            {/* Content */}
            <motion.div custom={5} variants={fadeIn} initial="hidden" animate="show">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-pn-text">
                  Content
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPreview(false)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      !preview
                        ? 'bg-pn-green/20 text-pn-green'
                        : 'text-pn-muted hover:text-pn-white'
                    }`}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreview(true)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      preview
                        ? 'bg-pn-green/20 text-pn-green'
                        : 'text-pn-muted hover:text-pn-white'
                    }`}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Preview
                  </button>
                </div>
              </div>

              {!preview ? (
                <div>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your guide content here... Markdown supported"
                    className={`${inputClass} min-h-[400px] resize-y font-mono text-sm leading-relaxed ${
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
                      {content.length.toLocaleString()} characters
                    </span>
                  </div>
                </div>
              ) : (
                <Card className="min-h-[400px]">
                  {content.trim() ? (
                    <div className="prose prose-invert max-w-none">
                      <div className="whitespace-pre-wrap text-sm text-pn-text leading-relaxed">
                        {content}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-[360px]">
                      <p className="text-pn-muted text-sm">
                        Nothing to preview yet. Start writing in the Edit tab.
                      </p>
                    </div>
                  )}
                </Card>
              )}
            </motion.div>

            {/* On-chain note */}
            <motion.div custom={6} variants={fadeIn} initial="hidden" animate="show">
              <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-pn-green/5 border border-pn-green/10">
                <Lock className="h-4 w-4 text-pn-green flex-shrink-0 mt-0.5" />
                <p className="text-xs text-pn-muted leading-relaxed">
                  Your Drop will be stamped on-chain with your authorship proof.
                  Once published, the content hash is permanently recorded on the
                  Sui blockchain as a verifiable proof of creation.
                </p>
              </div>
            </motion.div>

            {/* Submit */}
            <motion.div custom={7} variants={fadeIn} initial="hidden" animate="show">
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-pn-green text-pn-black text-sm font-bold hover:brightness-110 transition-all active:scale-[0.98]"
              >
                {connected ? 'Publish Drop' : 'Connect Wallet to Publish'}
              </button>
            </motion.div>
          </form>
        </div>
      </main>
    </div>
  );
}
