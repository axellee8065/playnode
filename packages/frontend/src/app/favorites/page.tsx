'use client';

import { type FC, useState } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import ContentCard from '@/components/feed/ContentCard';
import { useFavorites } from '@/hooks/useFavorites';
import { GAME_CATEGORIES } from '@/lib/games';
import { api, formatViews } from '@/lib/api';
import { useApi } from '@/hooks/useApi';

type Tab = 'games' | 'guides' | 'reviews';

const FavoritesPage: FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('games');
  const { favorites } = useFavorites();

  const tabs: { key: Tab; label: string }[] = [
    { key: 'games', label: 'Games' },
    { key: 'guides', label: 'Guides' },
    { key: 'reviews', label: 'Reviews' },
  ];

  return (
    <div className="min-h-screen bg-pn-black">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-0 lg:ml-56 pt-16">
          <div className="max-w-[1200px] mx-auto px-4 lg:px-6 py-8 space-y-6">
            <h1 className="text-pn-white text-2xl font-bold">Favorites</h1>

            {/* Tabs */}
            <div className="flex border-b border-pn-border">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`relative px-5 py-3 text-sm font-medium transition-colors ${
                    activeTab === t.key
                      ? 'text-pn-white border-b-2 border-pn-green'
                      : 'text-pn-muted hover:text-pn-text'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === 'games' && (
              <GamesTab gameTags={favorites.games} />
            )}
            {activeTab === 'guides' && (
              <GuidesTab dropIds={favorites.drops} />
            )}
            {activeTab === 'reviews' && (
              <ReviewsTab reviewIds={favorites.reviews} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

function GamesTab({ gameTags }: { gameTags: string[] }) {
  const favoriteGames = GAME_CATEGORIES.filter((g) => gameTags.includes(g.tag));

  if (favoriteGames.length === 0) {
    return (
      <p className="text-pn-muted text-sm py-12 text-center">
        No favorites yet. Browse games and click the bookmark icon to save them.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {favoriteGames.map((game) => (
        <a
          key={game.slug}
          href={`/game/${game.slug}`}
          className="block p-4 rounded-xl bg-pn-surface border border-pn-border hover:border-pn-green/50 transition-colors"
        >
          <h3 className="text-sm font-semibold text-pn-white">{game.label}</h3>
          <p className="text-xs text-pn-muted mt-1">/{game.slug}</p>
        </a>
      ))}
    </div>
  );
}

function GuidesTab({ dropIds }: { dropIds: string[] }) {
  const { data: drops } = useApi(
    () => dropIds.length > 0 ? api.getDrops({ take: 50 }) : Promise.resolve([]),
    [dropIds.join(',')]
  );

  if (dropIds.length === 0) {
    return (
      <p className="text-pn-muted text-sm py-12 text-center">
        No favorites yet. Browse guides and click the bookmark icon to save them.
      </p>
    );
  }

  const matchedDrops = Array.isArray(drops)
    ? drops.filter((d) => dropIds.includes(d.id))
    : [];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {matchedDrops.map((d) => (
        <ContentCard
          key={d.id}
          type="drop"
          id={d.id}
          title={d.title}
          gameTag={d.gameTag}
          author={d.node?.displayName || d.author}
          views={formatViews(d.totalViews)}
          price={d.isPremium ? String(Number(d.price) / 1_000_000) : undefined}
          isPremium={d.isPremium}
          createdAt={d.createdAt}
        />
      ))}
      {matchedDrops.length === 0 && drops !== undefined && (
        <p className="text-pn-muted text-sm col-span-full text-center py-12">
          Saved guides could not be loaded. They may have been removed.
        </p>
      )}
    </div>
  );
}

function ReviewsTab({ reviewIds }: { reviewIds: string[] }) {
  const { data: reviews } = useApi(
    () => reviewIds.length > 0 ? api.getReviews({ take: 50 }) : Promise.resolve([]),
    [reviewIds.join(',')]
  );

  if (reviewIds.length === 0) {
    return (
      <p className="text-pn-muted text-sm py-12 text-center">
        No favorites yet. Browse reviews and click the bookmark icon to save them.
      </p>
    );
  }

  const matchedReviews = Array.isArray(reviews)
    ? reviews.filter((r) => reviewIds.includes(r.id))
    : [];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {matchedReviews.map((r) => (
        <ContentCard
          key={r.id}
          type="review"
          id={r.id}
          title={`${r.gameTag?.replace(/_/g, ' ')} Review`}
          gameTag={r.gameTag}
          author={r.node?.displayName || r.author}
          views={formatViews(r.totalViews)}
          rating={r.rating / 10}
          verifiedHours={r.verifiedPlaytimeHours}
          createdAt={r.createdAt}
        />
      ))}
      {matchedReviews.length === 0 && reviews !== undefined && (
        <p className="text-pn-muted text-sm col-span-full text-center py-12">
          Saved reviews could not be loaded. They may have been removed.
        </p>
      )}
    </div>
  );
}

export default FavoritesPage;
