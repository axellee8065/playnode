'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search as SearchIcon, FileText, Star, User, Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import ContentCard from '@/components/feed/ContentCard';
import { Card } from '@/components/common';
import { api, formatViews } from '@/lib/api';
import { getGameLabel } from '@/lib/games';
import { useApi } from '@/hooks/useApi';

/* ------------------------------------------------------------------ */
/*  Mock search results                                                */
/* ------------------------------------------------------------------ */
function getMockResults(q: string) {
  const lower = q.toLowerCase();
  return {
    drops: [
      { id: 'mock-d1', type: 'drop', title: 'Charge Blade Master Guide', gameTag: 'MH_WILDS', author: 'GameMaster_KR', views: '24300', createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), price: '3990000', isPremium: true, category: 0 },
      { id: 'mock-d2', type: 'drop', title: 'Elden Ring Speedrun Route v4', gameTag: 'ELDEN_RING', author: 'SpeedKing', views: '18100', createdAt: new Date(Date.now() - 86400000 * 7).toISOString(), price: '0', isPremium: false, category: 4 },
      { id: 'mock-d3', type: 'drop', title: 'Valorant Tier List S8', gameTag: 'VALORANT', author: 'TierGod', views: '41200', createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), price: '1990000', isPremium: true, category: 3 },
    ].filter((d) => d.title.toLowerCase().includes(lower) || d.gameTag.toLowerCase().includes(lower)),
    reviews: [
      { id: 'mock-r1', type: 'review', title: 'Elden Ring Review', gameTag: 'ELDEN_RING', rating: 92, author: 'DragonSlayer', views: '18400', createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), verifiedHours: 240 },
      { id: 'mock-r2', type: 'review', title: "Baldur's Gate 3 Review", gameTag: 'BG3', rating: 95, author: 'CriticalGamer', views: '31200', createdAt: new Date(Date.now() - 86400000 * 14).toISOString(), verifiedHours: 180 },
    ].filter((r) => r.title.toLowerCase().includes(lower) || r.gameTag.toLowerCase().includes(lower)),
    nodes: [
      { id: 'mock-n1', type: 'node', displayName: 'GameMaster_KR', rank: 4, totalDrops: 12, totalReviews: 5 },
      { id: 'mock-n2', type: 'node', displayName: 'SpeedKing', rank: 3, totalDrops: 8, totalReviews: 3 },
    ].filter((n) => n.displayName.toLowerCase().includes(lower)),
  };
}

type FilterTab = 'all' | 'guides' | 'reviews' | 'creators';

/* ------------------------------------------------------------------ */
/*  Inner search content                                               */
/* ------------------------------------------------------------------ */
function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [filterTab, setFilterTab] = useState<FilterTab>('all');

  const { data: apiResults, loading, error } = useApi(
    () => (query ? api.search(query) : Promise.resolve(null)),
    [query],
  );

  const results = apiResults && !error
    ? {
        drops: Array.isArray(apiResults.drops) ? apiResults.drops : [],
        reviews: Array.isArray(apiResults.reviews) ? apiResults.reviews : [],
        nodes: Array.isArray(apiResults.nodes) ? apiResults.nodes : [],
      }
    : query
      ? getMockResults(query)
      : { drops: [], reviews: [], nodes: [] };

  const totalResults = results.drops.length + results.reviews.length + results.nodes.length;

  const filterTabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'guides', label: 'Guides' },
    { key: 'reviews', label: 'Reviews' },
    { key: 'creators', label: 'Game Curators' },
  ];

  const showDrops = filterTab === 'all' || filterTab === 'guides';
  const showReviews = filterTab === 'all' || filterTab === 'reviews';
  const showNodes = filterTab === 'all' || filterTab === 'creators';

  return (
    <>
      {/* Search header */}
      <div className="mb-6">
        {query && (
          <p className="text-pn-muted text-sm">
            {loading
              ? 'Searching...'
              : `${totalResults} result${totalResults !== 1 ? 's' : ''} for "${query}"`}
          </p>
        )}
      </div>

      {/* Filter tabs */}
      {query && !loading && totalResults > 0 && (
        <div className="flex gap-2 mb-6">
          {filterTabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilterTab(t.key)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterTab === t.key
                  ? 'bg-pn-white text-pn-black font-semibold'
                  : 'bg-pn-surface-2 text-pn-muted hover:text-pn-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 text-pn-green animate-spin" />
        </div>
      )}

      {/* No query */}
      {!loading && !query && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <SearchIcon className="h-12 w-12 text-pn-muted/30 mb-4" />
          <p className="text-pn-muted text-lg">Enter a search term to find guides, reviews, and game curators</p>
        </div>
      )}

      {/* Empty results */}
      {!loading && query && totalResults === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <SearchIcon className="h-12 w-12 text-pn-muted/30 mb-4" />
          <p className="text-pn-muted text-lg">No results found for &ldquo;{query}&rdquo;</p>
          <p className="text-pn-muted/60 text-sm mt-1">Try a different search term</p>
        </div>
      )}

      {/* Results */}
      {!loading && totalResults > 0 && (
        <div className="space-y-8">
          {/* Drops */}
          {showDrops && results.drops.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-4 w-4 text-pn-green" />
                <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-pn-muted">
                  Guides
                </h2>
                <span className="ml-1 rounded-full bg-pn-surface-2 px-2 py-0.5 text-[10px] font-mono text-pn-muted">
                  {results.drops.length}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {results.drops.map((drop: any) => (
                  <ContentCard
                    key={drop.id}
                    type="drop"
                    id={drop.id}
                    title={drop.title}
                    gameTag={drop.gameTag}
                    author={drop.node?.displayName || drop.author}
                    views={formatViews(drop.views || drop.totalViews)}
                    price={drop.isPremium ? String(Number(drop.price) / 1_000_000) : undefined}
                    isPremium={drop.isPremium}
                    createdAt={drop.createdAt || new Date().toISOString()}
                    category={drop.category}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          {showReviews && results.reviews.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Star className="h-4 w-4 text-pn-cyan" />
                <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-pn-muted">
                  Reviews
                </h2>
                <span className="ml-1 rounded-full bg-pn-surface-2 px-2 py-0.5 text-[10px] font-mono text-pn-muted">
                  {results.reviews.length}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {results.reviews.map((review: any) => (
                  <ContentCard
                    key={review.id}
                    type="review"
                    id={review.id}
                    title={review.title || `${getGameLabel(review.gameTag)} Review`}
                    gameTag={review.gameTag || ''}
                    author={review.node?.displayName || review.author}
                    views={formatViews(review.views || review.totalViews)}
                    rating={review.rating ? review.rating / 10 : undefined}
                    verifiedHours={review.verifiedHours}
                    createdAt={review.createdAt || new Date().toISOString()}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Game Curators */}
          {showNodes && results.nodes.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <User className="h-4 w-4 text-pn-purple" />
                <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-pn-muted">
                  Game Curators
                </h2>
                <span className="ml-1 rounded-full bg-pn-surface-2 px-2 py-0.5 text-[10px] font-mono text-pn-muted">
                  {results.nodes.length}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {results.nodes.map((node: any) => (
                  <a key={node.id} href={`/node/${node.id}`} className="block">
                    <Card className="!p-4 group cursor-pointer hover:border-pn-border-light transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-pn-purple/10 border border-pn-purple/20 font-mono text-sm font-bold text-pn-purple">
                          {(node.displayName || '?')[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-pn-white group-hover:text-pn-purple transition-colors truncate">
                            {node.displayName}
                          </h3>
                          <p className="text-xs text-pn-muted mt-0.5">
                            Rank {node.rank} &middot; {node.totalDrops} guides &middot; {node.totalReviews} reviews
                          </p>
                        </div>
                      </div>
                    </Card>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function SearchPage() {
  return (
    <div className="min-h-screen bg-pn-black">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-0 lg:ml-56 pt-16">
          <div className="px-4 lg:px-6 py-6">
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-6 w-6 text-pn-green animate-spin" />
                </div>
              }
            >
              <SearchContent />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
