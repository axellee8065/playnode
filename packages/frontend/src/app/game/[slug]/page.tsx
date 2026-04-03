'use client';

import { type FC, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Star,
  Eye,
  Users,
  FileText,
  ShoppingBag,
  Grid3X3,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { Badge, Button, Card, UsdcAmount } from '@/components/common';
import { api, formatViews, formatUsdc } from '@/lib/api';
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

const game = {
  title: 'Monster Hunter Wilds',
  subtitle: '몬스터 헌터 와일즈',
  developer: 'Capcom',
  releaseDate: '2025-02-28',
  stats: {
    drops: 234,
    reviews: 89,
    avgRating: 8.4,
    creators: 56,
  },
};

type TabKey = 'drops' | 'reviews' | 'shop' | 'grid';

const categoryBadges: Record<string, 'drop' | 'review' | 'shop' | 'quest' | 'rank'> = {
  BOSS: 'rank',
  BUILD: 'drop',
  QUEST: 'quest',
  GUIDE: 'drop',
  REVIEW: 'review',
  GEAR: 'shop',
};

const drops = [
  {
    title: '차전룡 지누오가 소셜 완벽 공략',
    author: 'HunterPro_KR',
    price: 4.99,
    views: '32.1K',
    category: 'BOSS',
  },
  {
    title: '대검 빌드 시즌2 메타 가이드',
    author: 'WeaponMaster',
    price: 6.99,
    views: '28.7K',
    category: 'BUILD',
  },
  {
    title: '마스터랭크 긴급퀘 전체 클리어 루트',
    author: 'SpeedRunner_JP',
    price: 3.99,
    views: '24.5K',
    category: 'QUEST',
  },
  {
    title: '초심자 완벽 입문 가이드 2026',
    author: 'NewbieHelper',
    price: 0,
    views: '45.2K',
    category: 'GUIDE',
  },
  {
    title: '활 빌드 DPS 극대화 세팅',
    author: 'BowGod',
    price: 5.49,
    views: '19.8K',
    category: 'BUILD',
  },
  {
    title: '레어 장식주 효율 파밍 루트',
    author: 'FarmKing',
    price: 2.99,
    views: '22.3K',
    category: 'GEAR',
  },
];

const topCreators = [
  { name: 'HunterPro_KR', rank: 1, drops: 18, followers: '8.2K' },
  { name: 'WeaponMaster', rank: 2, drops: 15, followers: '6.5K' },
  { name: 'SpeedRunner_JP', rank: 3, drops: 12, followers: '5.1K' },
  { name: 'BowGod', rank: 4, drops: 9, followers: '4.8K' },
];

const shopLinks = [
  { store: 'Steam', price: 59.99, url: '#', badge: 'PC' },
  { store: 'Epic Games', price: 59.99, url: '#', badge: 'PC' },
  { store: 'Humble Bundle', price: 53.99, url: '#', badge: 'PC / -10%' },
];

const reviewItems = [
  { title: '400시간 후 솔직 리뷰', author: 'HunterPro_KR', score: 9.1, helpful: 842 },
  { title: '캐주얼 게이머의 시점에서', author: 'CasualPlayer', score: 7.8, helpful: 356 },
  { title: '시리즈 팬이 본 와일즈', author: 'MH_Veteran', score: 8.9, helpful: 621 },
  { title: 'PC 성능 & 그래픽 분석', author: 'TechReviewer', score: 8.2, helpful: 489 },
];

/* ------------------------------------------------------------------ */
/*  Pixel Grid                                                         */
/* ------------------------------------------------------------------ */

const GRID_COLS = 20;
const GRID_ROWS = 10;

// Pre-generate some "sold" pixels
const soldPixels = new Set([
  '2-3', '2-4', '3-3', '3-4', '3-5',
  '8-1', '8-2', '9-1', '9-2',
  '14-6', '14-7', '15-6', '15-7', '15-8',
  '5-8', '6-8', '6-9', '7-8',
  '17-3', '18-3', '18-4',
  '11-5', '12-5', '12-6',
  '0-0', '1-0', '0-1',
  '19-9', '18-9', '19-8',
]);

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

const GameHubPage: FC = () => {
  const params = useParams();
  const slug = params.slug as string;
  const [tab, setTab] = useState<TabKey>('drops');

  // Fetch live data from API
  const { data: apiGame } = useApi(() => api.getGame(slug), [slug]);
  const { data: apiGameDrops } = useApi(() => api.getGameDrops(slug), [slug]);
  const { data: apiGameReviews } = useApi(() => api.getGameReviews(slug), [slug]);

  // Map API data to display values, fall back to mock
  const displayGame = apiGame
    ? {
        title: apiGame.title || game.title,
        subtitle: apiGame.subtitle || game.subtitle,
        developer: apiGame.developer || game.developer,
        releaseDate: apiGame.releaseDate || game.releaseDate,
        stats: {
          drops: apiGameDrops?.length ?? game.stats.drops,
          reviews: apiGameReviews?.length ?? game.stats.reviews,
          avgRating: game.stats.avgRating,
          creators: game.stats.creators,
        },
      }
    : game;

  const displayDrops = apiGameDrops
    ? apiGameDrops.map((d) => ({
        title: d.title,
        author: d.node?.displayName || d.author,
        price: Number(d.price) / 1_000_000,
        views: formatViews(d.totalViews),
        category: 'GUIDE',
      }))
    : drops;

  const displayReviews = apiGameReviews
    ? apiGameReviews.map((r) => ({
        title: `${r.gameTag} Review`,
        author: r.node?.displayName || r.author,
        score: r.rating / 10,
        helpful: r.helpfulCount,
      }))
    : reviewItems;

  const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
    { key: 'drops', label: 'Drops', icon: FileText },
    { key: 'reviews', label: 'Reviews', icon: Star },
    { key: 'shop', label: 'Shop', icon: ShoppingBag },
    { key: 'grid', label: 'Grid', icon: Grid3X3 },
  ];

  return (
    <div className="min-h-screen bg-pn-black">
      {/* ============================================================= */}
      {/* Game Banner                                                    */}
      {/* ============================================================= */}
      <div className="relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-pn-cyan/8 via-pn-surface/50 to-pn-black" />
        <div className="absolute inset-0 bg-gradient-to-r from-pn-green/5 to-pn-cyan/5" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(rgba(42,42,50,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(42,42,50,0.4) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative max-w-[1200px] mx-auto px-4 lg:px-6 pt-16 pb-10">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={fadeUp} className="flex items-center gap-2 mb-2">
              <span className="font-mono text-[10px] text-pn-muted uppercase tracking-wider">
                {displayGame.developer}
              </span>
              <span className="text-pn-muted">·</span>
              <span className="font-mono text-[10px] text-pn-muted uppercase tracking-wider">
                {displayGame.releaseDate}
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-pn-white text-4xl sm:text-5xl font-bold leading-tight mb-2"
            >
              {displayGame.title}
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-pn-text text-lg mb-8"
            >
              {displayGame.subtitle}
            </motion.p>

            {/* Stats Row */}
            <motion.div
              variants={fadeUp}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
              {[
                { label: 'Total Drops', value: displayGame.stats.drops.toString(), icon: FileText, color: 'text-pn-green' },
                { label: 'Total Reviews', value: displayGame.stats.reviews.toString(), icon: Star, color: 'text-pn-cyan' },
                { label: 'Avg Rating', value: displayGame.stats.avgRating.toFixed(1), icon: TrendingUp, color: 'text-pn-amber' },
                { label: 'Total Creators', value: displayGame.stats.creators.toString(), icon: Users, color: 'text-pn-purple' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-pn-surface/60 backdrop-blur-sm border border-pn-border rounded-xl p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    <span className="font-mono text-[10px] text-pn-muted uppercase tracking-wider">
                      {stat.label}
                    </span>
                  </div>
                  <span className={`font-mono text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ============================================================= */}
      {/* Content Area                                                   */}
      {/* ============================================================= */}
      <main className="max-w-[1200px] mx-auto px-4 lg:px-6 py-8 space-y-8">
        {/* Tabs */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-1 p-1 bg-pn-surface border border-pn-border rounded-xl w-fit">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-lg transition-colors ${
                  tab === t.key
                    ? 'bg-pn-surface-2 text-pn-white'
                    : 'text-pn-muted hover:text-pn-text'
                }`}
              >
                <t.icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ---- Drops Tab ---- */}
        {tab === 'drops' && (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="space-y-8"
          >
            {/* Drop Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayDrops.map((drop, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <Card className="h-full hover:border-pn-border-light transition-colors cursor-pointer group">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant={categoryBadges[drop.category] ?? 'drop'}>
                        {drop.category}
                      </Badge>
                      <div className="flex items-center gap-1 text-pn-muted">
                        <Eye className="w-3 h-3" />
                        <span className="font-mono text-[10px]">{drop.views}</span>
                      </div>
                    </div>
                    <h3 className="text-sm font-semibold text-pn-white mb-2 group-hover:text-pn-green transition-colors line-clamp-2">
                      {drop.title}
                    </h3>
                    <div className="flex items-center justify-between mt-auto pt-2">
                      <span className="font-mono text-[11px] text-pn-muted">
                        by {drop.author}
                      </span>
                      {drop.price > 0 ? (
                        <UsdcAmount amount={drop.price} size="sm" />
                      ) : (
                        <span className="font-mono text-xs font-bold text-pn-green">
                          FREE
                        </span>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Top Creators */}
            <motion.div variants={fadeUp}>
              <p className="font-mono text-[10px] uppercase tracking-wider text-pn-muted mb-4">
                Top Creators for this Game
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {topCreators.map((creator) => (
                  <Card key={creator.name} className="!p-4 text-center cursor-pointer group">
                    {/* Rank badge */}
                    <div className="flex justify-center mb-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] font-bold ${
                        creator.rank === 1
                          ? 'bg-pn-amber/20 text-pn-amber'
                          : creator.rank === 2
                          ? 'bg-pn-cyan/20 text-pn-cyan'
                          : 'bg-pn-surface-2 text-pn-muted'
                      }`}>
                        {creator.rank}
                      </div>
                    </div>
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-pn-surface-2 border border-pn-border mx-auto mb-2 flex items-center justify-center">
                      <span className="font-mono text-sm text-pn-green">
                        {creator.name.charAt(0)}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-pn-white truncate group-hover:text-pn-green transition-colors">
                      {creator.name}
                    </p>
                    <div className="flex items-center justify-center gap-3 mt-2">
                      <span className="font-mono text-[10px] text-pn-muted">
                        {creator.drops} drops
                      </span>
                      <span className="font-mono text-[10px] text-pn-muted">
                        {creator.followers}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ---- Reviews Tab ---- */}
        {tab === 'reviews' && (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {displayReviews.map((r, i) => (
              <motion.div key={i} variants={fadeUp}>
                <Card className="cursor-pointer group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-pn-white group-hover:text-pn-cyan transition-colors mb-1">
                        {r.title}
                      </h3>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[11px] text-pn-muted">
                          by {r.author}
                        </span>
                        <span className="font-mono text-[10px] text-pn-muted">
                          {r.helpful.toLocaleString()}명이 도움됨
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Star className="w-4 h-4 text-pn-amber fill-pn-amber" />
                      <span className="font-mono text-lg font-bold text-pn-white">
                        {r.score.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
            <motion.div variants={fadeUp} className="flex justify-center pt-2">
              <Button variant="ghost" size="sm">
                모든 리뷰 보기
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </motion.div>
          </motion.div>
        )}

        {/* ---- Shop Tab ---- */}
        {tab === 'shop' && (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            <motion.div variants={fadeUp}>
              <p className="font-mono text-[10px] uppercase tracking-wider text-pn-muted mb-4">
                구매 링크 (Affiliate)
              </p>
            </motion.div>
            {shopLinks.map((link, i) => (
              <motion.div key={i} variants={fadeUp}>
                <Card className="group cursor-pointer">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {/* Store icon placeholder */}
                      <div className="w-10 h-10 rounded-lg bg-pn-surface-2 border border-pn-border flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-pn-amber" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-pn-white group-hover:text-pn-amber transition-colors">
                          {link.store}
                        </p>
                        <span className="inline-flex items-center rounded px-1.5 py-0.5 font-mono text-pn-muted bg-pn-surface-2 mt-1"
                          style={{ fontSize: '9px' }}
                        >
                          {link.badge}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <UsdcAmount amount={link.price} size="md" />
                      <Button variant="primary" size="sm">
                        <ExternalLink className="w-3.5 h-3.5" />
                        구매
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ---- Grid Tab ---- */}
        {tab === 'grid' && (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            <motion.div variants={fadeUp}>
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-pn-muted mb-1">
                      Game Pixel Grid
                    </p>
                    <p className="text-sm text-pn-text">
                      픽셀을 구매하여 이 게임 페이지에 광고를 게재하세요
                    </p>
                  </div>
                  <Badge variant="grid">PIXEL GRID</Badge>
                </div>

                {/* Grid */}
                <div className="overflow-x-auto pb-2">
                  <div
                    className="inline-grid gap-[2px]"
                    style={{
                      gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
                    }}
                  >
                    {Array.from({ length: GRID_ROWS * GRID_COLS }).map((_, idx) => {
                      const col = idx % GRID_COLS;
                      const row = Math.floor(idx / GRID_COLS);
                      const key = `${col}-${row}`;
                      const isSold = soldPixels.has(key);

                      return (
                        <motion.div
                          key={key}
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{
                            duration: 0.2,
                            delay: idx * 0.003,
                          }}
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-sm cursor-pointer transition-colors ${
                            isSold
                              ? 'bg-pn-purple/60 border border-pn-purple/40 hover:bg-pn-purple/80'
                              : 'bg-pn-surface-2 border border-pn-border hover:bg-pn-surface-3 hover:border-pn-border-light'
                          }`}
                          title={
                            isSold
                              ? `Pixel (${col}, ${row}) — Sold`
                              : `Pixel (${col}, ${row}) — Available`
                          }
                        />
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-6 mt-4 pt-4 border-t border-pn-border">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-sm bg-pn-surface-2 border border-pn-border" />
                    <span className="font-mono text-[10px] text-pn-muted">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-sm bg-pn-purple/60 border border-pn-purple/40" />
                    <span className="font-mono text-[10px] text-pn-muted">Sold</span>
                  </div>
                  <div className="ml-auto">
                    <span className="font-mono text-[10px] text-pn-muted">
                      {soldPixels.size}/{GRID_COLS * GRID_ROWS} pixels sold
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {/* ---- Shop Links (always visible at bottom on drops tab) ---- */}
        {tab === 'drops' && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.5 }}
          >
            <p className="font-mono text-[10px] uppercase tracking-wider text-pn-muted mb-4">
              이 게임 구매하기
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {shopLinks.map((link, i) => (
                <Card key={i} className="!p-4 group cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <ShoppingBag className="w-4 h-4 text-pn-amber" />
                    <span className="text-sm font-semibold text-pn-white group-hover:text-pn-amber transition-colors">
                      {link.store}
                    </span>
                    <span className="ml-auto inline-flex items-center rounded px-1.5 py-0.5 font-mono text-pn-muted bg-pn-surface-2"
                      style={{ fontSize: '9px' }}
                    >
                      {link.badge}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <UsdcAmount amount={link.price} size="sm" />
                    <Button variant="primary" size="sm">
                      <ExternalLink className="w-3 h-3" />
                      Buy
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default GameHubPage;
