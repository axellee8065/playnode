'use client';

import { type FC, useState } from 'react';
import { useParams } from 'next/navigation';
import { ExternalLink, ShoppingBag } from 'lucide-react';
import { Button, Card, UsdcAmount } from '@/components/common';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import ContentCard from '@/components/feed/ContentCard';
import CategoryBar from '@/components/layout/CategoryBar';
import { CONTENT_CATEGORIES } from '@/lib/games';
import { api, formatViews } from '@/lib/api';
import { useApi } from '@/hooks/useApi';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const CATEGORY_ITEMS = CONTENT_CATEGORIES.map((c) => ({
  label: c.label,
  value: String(c.id),
}));

type TabKey = 'guides' | 'reviews' | 'shop';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */
const mockGame = {
  title: 'Monster Hunter Wilds',
  subtitle: 'The ultimate hunting experience awaits',
  developer: 'Capcom',
  releaseDate: '2025-02-28',
  stats: { drops: 234, reviews: 89, curators: 56 },
};

const shopLinks = [
  { store: 'Steam', price: 59.99, url: 'https://store.steampowered.com', badge: 'PC' },
  { store: 'Epic Games', price: 59.99, url: 'https://www.epicgames.com', badge: 'PC' },
  { store: 'Humble Bundle', price: 53.99, url: 'https://www.humblebundle.com', badge: 'PC / -10%' },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
const GameHubPage: FC = () => {
  const params = useParams();
  const slug = params.slug as string;
  const [tab, setTab] = useState<TabKey>('guides');
  const [activeCategory, setActiveCategory] = useState('all');

  // Fetch live data from API
  const { data: apiGame } = useApi(() => api.getGame(slug), [slug]);
  const { data: apiGameDrops } = useApi(() => api.getGameDrops(slug), [slug]);
  const { data: apiGameReviews } = useApi(() => api.getGameReviews(slug), [slug]);

  const displayGame = apiGame
    ? {
        title: apiGame.title || mockGame.title,
        stats: {
          drops: apiGameDrops?.length ?? mockGame.stats.drops,
          reviews: apiGameReviews?.length ?? mockGame.stats.reviews,
          curators: mockGame.stats.curators,
        },
      }
    : { title: mockGame.title, stats: mockGame.stats };

  const displayDrops = apiGameDrops
    ? apiGameDrops.map((d) => ({
        id: d.id || `drop-${Math.random()}`,
        title: d.title,
        author: d.node?.displayName || d.author,
        price: Number(d.price) / 1_000_000,
        views: formatViews(d.totalViews),
        gameTag: d.gameTag,
        category: d.category ?? 5,
        isPremium: d.isPremium,
        createdAt: d.createdAt,
      }))
    : null;

  const displayReviews = apiGameReviews
    ? apiGameReviews.map((r) => ({
        id: r.id || `review-${Math.random()}`,
        title: `${r.gameTag?.replace(/_/g, ' ')} Review`,
        author: r.node?.displayName || r.author,
        rating: r.rating / 10,
        views: formatViews(r.totalViews),
        gameTag: r.gameTag,
        verifiedHours: r.verifiedPlaytimeHours,
        createdAt: r.createdAt,
      }))
    : null;

  // Filter drops by category
  const filteredDrops = displayDrops
    ? displayDrops.filter((d) => activeCategory === 'all' || d.category === Number(activeCategory))
    : [];

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'guides', label: 'Guides' },
    { key: 'reviews', label: 'Reviews' },
    { key: 'shop', label: 'Shop' },
  ];

  return (
    <div className="min-h-screen bg-pn-black">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-0 lg:ml-56 pt-16">
          {/* Compact game header */}
          <div className="px-4 lg:px-6 pt-6 pb-4 border-b border-pn-border">
            <h1 className="text-2xl sm:text-3xl font-bold text-pn-white">
              {displayGame.title}
            </h1>
            <p className="text-sm text-pn-muted mt-1">
              {displayGame.stats.drops} guides &middot; {displayGame.stats.reviews} reviews &middot; {displayGame.stats.curators} game curators
            </p>

            {/* Tabs */}
            <div className="flex items-center gap-1 mt-4">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    tab === t.key
                      ? 'bg-pn-white text-pn-black font-semibold'
                      : 'text-pn-muted hover:text-pn-white hover:bg-pn-surface-2'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Guides Tab */}
          {tab === 'guides' && (
            <>
              <CategoryBar
                items={CATEGORY_ITEMS}
                active={activeCategory}
                onChange={setActiveCategory}
              />
              <div className="px-4 lg:px-6 py-6">
                {displayDrops ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredDrops.map((drop) => (
                      <ContentCard
                        key={drop.id}
                        type="drop"
                        id={drop.id}
                        title={drop.title}
                        gameTag={drop.gameTag}
                        author={drop.author}
                        views={drop.views}
                        price={drop.isPremium ? String(drop.price) : undefined}
                        isPremium={drop.isPremium}
                        createdAt={drop.createdAt}
                        category={drop.category}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-pn-muted text-sm text-center py-12">
                    Loading guides...
                  </p>
                )}
              </div>
            </>
          )}

          {/* Reviews Tab */}
          {tab === 'reviews' && (
            <div className="px-4 lg:px-6 py-6">
              {displayReviews ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {displayReviews.map((r) => (
                    <ContentCard
                      key={r.id}
                      type="review"
                      id={r.id}
                      title={r.title}
                      gameTag={r.gameTag}
                      author={r.author}
                      views={r.views}
                      rating={r.rating}
                      verifiedHours={r.verifiedHours}
                      createdAt={r.createdAt}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-pn-muted text-sm text-center py-12">
                  Loading reviews...
                </p>
              )}
            </div>
          )}

          {/* Shop Tab */}
          {tab === 'shop' && (
            <div className="px-4 lg:px-6 py-6 space-y-4 max-w-2xl">
              <p className="font-mono text-[10px] uppercase tracking-wider text-pn-muted mb-4">
                Purchase Links (Affiliate)
              </p>
              {shopLinks.map((link, i) => (
                <Card key={i} className="group cursor-pointer">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-pn-surface-2 border border-pn-border flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-pn-amber" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-pn-white group-hover:text-pn-amber transition-colors">
                          {link.store}
                        </p>
                        <span
                          className="inline-flex items-center rounded px-1.5 py-0.5 font-mono text-pn-muted bg-pn-surface-2 mt-1"
                          style={{ fontSize: '9px' }}
                        >
                          {link.badge}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <UsdcAmount amount={link.price} size="md" />
                      <Button variant="primary" size="sm" onClick={() => window.open(link.url, '_blank')}>
                        <ExternalLink className="w-3.5 h-3.5" />
                        Buy
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default GameHubPage;
