'use client';

import { type FC, useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { Button, Card, UsdcAmount } from '@/components/common';
import { api } from '@/lib/api';
import { useApi } from '@/hooks/useApi';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */
type GameCategory = 'all' | 'rpg' | 'fps' | 'strategy' | 'indie' | 'mmo';

const categoryLabels: Record<GameCategory, string> = {
  all: 'All', rpg: 'RPG', fps: 'FPS', strategy: 'Strategy', indie: 'Indie', mmo: 'MMO',
};

interface GameItem {
  id: string; title: string; price: number; platform: string; rating: number; category: GameCategory; coverColor: string;
}

const trendingGames: GameItem[] = [
  { id: 'g1', title: 'Monster Hunter Wilds', price: 59.99, platform: 'STEAM', rating: 4.8, category: 'rpg', coverColor: 'from-orange-900 to-red-900' },
  { id: 'g2', title: 'Elden Ring: Nightreign', price: 39.99, platform: 'STEAM', rating: 4.9, category: 'rpg', coverColor: 'from-yellow-900 to-amber-900' },
  { id: 'g3', title: 'GTA VI', price: 69.99, platform: 'EPIC', rating: 4.7, category: 'rpg', coverColor: 'from-blue-900 to-cyan-900' },
  { id: 'g4', title: 'Valorant: Episode 10', price: 0, platform: 'EPIC', rating: 4.3, category: 'fps', coverColor: 'from-red-900 to-pink-900' },
  { id: 'g5', title: 'Civilization VII', price: 49.99, platform: 'STEAM', rating: 4.5, category: 'strategy', coverColor: 'from-emerald-900 to-teal-900' },
  { id: 'g6', title: 'Hollow Knight: Silksong', price: 29.99, platform: 'STEAM', rating: 4.9, category: 'indie', coverColor: 'from-indigo-900 to-purple-900' },
];

interface BundleItem { title: string; price: number; }

const featuredBundle = {
  title: '2024 Must-Play RPGs',
  curator: 'GameMaster_KR',
  games: [
    { title: 'Elden Ring: Shadow of the Erdtree', price: 39.99 },
    { title: "Baldur's Gate 3", price: 59.99 },
    { title: 'Final Fantasy VII Rebirth', price: 49.99 },
    { title: 'Dragon Age: The Veilguard', price: 59.99 },
    { title: 'Metaphor: ReFantazio', price: 59.99 },
  ] as BundleItem[],
  discount: 25,
};

interface CreatorPick {
  creator: string; gameTitle: string; review: string; rating: number; platform: string; price: number; coverColor: string;
}

const creatorPicks: CreatorPick[] = [
  { creator: 'SoulsBorne_Pro', gameTitle: 'Elden Ring: Nightreign', review: 'A new standard for co-op soulslike.', rating: 4.9, platform: 'STEAM', price: 39.99, coverColor: 'from-yellow-900 to-amber-900' },
  { creator: 'RPG_Queen', gameTitle: 'Metaphor: ReFantazio', review: "Atlus's bold new venture. A masterpiece.", rating: 4.8, platform: 'STEAM', price: 59.99, coverColor: 'from-purple-900 to-indigo-900' },
  { creator: 'IndieDev_Lee', gameTitle: 'Hollow Knight: Silksong', review: 'Level design and combat that surpasses the original.', rating: 4.9, platform: 'STEAM', price: 29.99, coverColor: 'from-indigo-900 to-purple-900' },
  { creator: 'FPS_Hawk', gameTitle: 'Monster Hunter Wilds', review: 'Best graphics and ecosystem system in the series.', rating: 4.8, platform: 'STEAM', price: 59.99, coverColor: 'from-orange-900 to-red-900' },
];

/* ------------------------------------------------------------------ */
/*  Star Rating                                                        */
/* ------------------------------------------------------------------ */
const StarRating: FC<{ rating: number }> = ({ rating }) => {
  const fullStars = Math.floor(rating);
  return (
    <div className="flex items-center gap-0.5 text-xs">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < fullStars ? 'text-pn-amber' : 'text-pn-surface-3'}>
          ★
        </span>
      ))}
      <span className="ml-1 font-mono text-[10px] text-pn-muted">{rating.toFixed(1)}</span>
    </div>
  );
};

const platformColors: Record<string, string> = {
  STEAM: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  EPIC: 'bg-pn-surface-2 text-pn-text border-pn-border',
};

const PlatformBadge: FC<{ platform: string }> = ({ platform }) => (
  <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 font-mono uppercase tracking-wider ${platformColors[platform] || ''}`} style={{ fontSize: '9px' }}>
    {platform}
  </span>
);

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
const ShopPage: FC = () => {
  const [category, setCategory] = useState<GameCategory>('all');

  const { data: apiBundles } = useApi(() => api.getBundles(), []);

  const displayBundle = apiBundles && apiBundles.length > 0
    ? { title: apiBundles[0].title || featuredBundle.title, curator: apiBundles[0].curator || featuredBundle.curator, games: apiBundles[0].games || featuredBundle.games, discount: apiBundles[0].discount || featuredBundle.discount }
    : featuredBundle;

  const bundleTotalValue = displayBundle.games.reduce((sum: number, g: BundleItem) => sum + g.price, 0);
  const bundlePrice = bundleTotalValue * (1 - displayBundle.discount / 100);

  const filteredGames = category === 'all' ? trendingGames : trendingGames.filter((g) => g.category === category);

  return (
    <div className="min-h-screen bg-pn-black">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-0 lg:ml-56 pt-16">
          <div className="px-4 lg:px-6 py-6 space-y-8">
            {/* Small title */}
            <h1 className="font-mono text-sm font-semibold uppercase tracking-wider text-pn-muted">
              Game Shop
            </h1>

            {/* Featured Bundle */}
            <Card className="relative overflow-hidden !p-0">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-pn-amber" />
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-pn-amber font-semibold">Featured Bundle</span>
                      <span className="inline-flex items-center rounded-md bg-pn-amber/20 border border-pn-amber/30 px-2 py-0.5 font-mono text-pn-amber font-bold" style={{ fontSize: '10px' }}>-{displayBundle.discount}%</span>
                    </div>
                    <h2 className="text-pn-white text-2xl font-bold mb-1">{displayBundle.title}</h2>
                    <p className="text-pn-muted text-sm mb-4">Curated by <span className="text-pn-amber font-medium">{displayBundle.curator}</span> &middot; {displayBundle.games.length} games</p>
                    <div className="space-y-2 mb-4">
                      {displayBundle.games.map((game: BundleItem) => (
                        <div key={game.title} className="flex items-center justify-between py-1.5 border-b border-pn-border/30 last:border-0">
                          <span className="text-pn-text text-sm">{game.title}</span>
                          <span className="font-mono text-xs text-pn-muted line-through">${game.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="lg:w-64 shrink-0 bg-pn-dark rounded-xl border border-pn-border p-5 text-center">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-pn-muted mb-2">Bundle Price</p>
                    <span className="font-mono text-3xl font-bold text-pn-amber">${bundlePrice.toFixed(2)}</span>
                    <span className="ml-1 font-mono text-[10px] text-pn-muted">USDC</span>
                    <p className="text-pn-muted text-xs mt-1 mb-4">Total value: <span className="line-through">${bundleTotalValue.toFixed(2)}</span></p>
                    <Button variant="secondary" size="lg" className="!bg-pn-amber/10 !border-pn-amber/30 !text-pn-amber hover:!bg-pn-amber/20 w-full" onClick={() => window.open('https://store.steampowered.com', '_blank')}>
                      Buy Bundle
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Category pills */}
            <div className="flex flex-wrap items-center gap-2">
              {(Object.keys(categoryLabels) as GameCategory[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setCategory(key)}
                  className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    category === key
                      ? 'bg-pn-white text-pn-black font-semibold'
                      : 'bg-pn-surface-2 text-pn-muted hover:text-pn-white'
                  }`}
                >
                  {categoryLabels[key]}
                </button>
              ))}
            </div>

            {/* Trending Games */}
            <div>
              <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-pn-muted mb-4">Trending Games</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {filteredGames.map((game) => (
                  <Card key={game.id} className="h-full !p-0 overflow-hidden">
                    <div className={`h-[130px] bg-gradient-to-br ${game.coverColor} flex items-center justify-center`}>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-white/30">COVER ART</span>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <PlatformBadge platform={game.platform} />
                        <StarRating rating={game.rating} />
                      </div>
                      <h3 className="text-pn-white font-semibold text-sm mb-3 line-clamp-1">{game.title}</h3>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-lg font-bold text-pn-green">
                          {game.price > 0 ? `$${game.price.toFixed(2)}` : 'Free'}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Curator Picks */}
            <div>
              <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-pn-muted mb-4">Curator Picks</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {creatorPicks.map((pick) => (
                  <Card key={pick.gameTitle + pick.creator} className="h-full">
                    <div className="flex gap-4">
                      <div className={`w-20 h-28 rounded-lg bg-gradient-to-br ${pick.coverColor} flex items-center justify-center shrink-0`}>
                        <span className="font-mono text-[8px] uppercase tracking-wider text-white/30 text-center px-1">COVER</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-5 h-5 rounded-full bg-pn-amber/20 border border-pn-amber/30 flex items-center justify-center shrink-0">
                            <span className="text-[8px] font-mono text-pn-amber font-bold">{pick.creator[0]}</span>
                          </div>
                          <span className="text-xs text-pn-amber font-medium">{pick.creator}</span>
                          <PlatformBadge platform={pick.platform} />
                        </div>
                        <h3 className="text-pn-white font-semibold text-sm mb-1">{pick.gameTitle}</h3>
                        <StarRating rating={pick.rating} />
                        <p className="text-pn-muted text-xs leading-relaxed mt-2 line-clamp-2">&ldquo;{pick.review}&rdquo;</p>
                        <div className="flex items-center justify-between mt-3">
                          <UsdcAmount amount={pick.price} size="sm" />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ShopPage;
